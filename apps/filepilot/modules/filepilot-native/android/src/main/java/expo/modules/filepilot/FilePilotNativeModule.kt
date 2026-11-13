package expo.modules.filepilot

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.os.Build
import android.os.ParcelFileDescriptor
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sqrt

/**
 * FilePilot's on-device native helpers. Everything runs locally on a background
 * dispatcher; nothing here touches the network.
 *
 * - PDF page count + page rendering with Android's built-in PdfRenderer (API 21+).
 * - Alpha flattening for JPEG output (Android's JPEG encoder would turn transparent pixels black).
 *
 * Every bitmap is bounded (edge + pixel budget) and recycled immediately after encoding.
 */
class FilePilotNativeModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("FilePilotNative")

    AsyncFunction("getPdfPageCount") Coroutine { uri: String ->
      withContext(Dispatchers.IO) {
        openRenderer(uri).use { (renderer, _) -> renderer.pageCount }
      }
    }

    AsyncFunction("getPdfPageSize") Coroutine { uri: String, pageIndex: Int ->
      withContext(Dispatchers.IO) {
        openRenderer(uri).use { (renderer, _) ->
          checkPage(renderer, pageIndex)
          renderer.openPage(pageIndex).use { page -> mapOf("width" to page.width, "height" to page.height) }
        }
      }
    }

    AsyncFunction("renderPdfPage") Coroutine { options: RenderPageOptions ->
      withContext(Dispatchers.IO) { renderPage(options) }
    }

    AsyncFunction("flattenImage") Coroutine { options: FlattenOptions ->
      withContext(Dispatchers.IO) { flatten(options) }
    }
  }

  /** Pair of renderer + descriptor, closed together. */
  private class RendererHandle(val renderer: PdfRenderer, val descriptor: ParcelFileDescriptor) : AutoCloseable {
    operator fun component1() = renderer
    operator fun component2() = descriptor
    override fun close() {
      try { renderer.close() } catch (_: Throwable) {}
      try { descriptor.close() } catch (_: Throwable) {}
    }
  }

  private fun fileOf(uri: String): File {
    val parsed = Uri.parse(uri)
    val path = if (parsed.scheme == "file") parsed.path else if (parsed.scheme == null) uri else null
    if (path == null) throw InvalidUriException(uri)
    return File(path)
  }

  private fun openRenderer(uri: String): RendererHandle {
    val file = fileOf(uri)
    if (!file.exists()) throw FileMissingException()
    val descriptor = ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY)
    return try {
      RendererHandle(PdfRenderer(descriptor), descriptor)
    } catch (e: SecurityException) {
      descriptor.close()
      throw PdfPasswordException(e)
    } catch (e: Throwable) {
      descriptor.close()
      throw PdfOpenException(e)
    }
  }

  private fun checkPage(renderer: PdfRenderer, index: Int) {
    if (index < 0 || index >= renderer.pageCount) throw PageOutOfRangeException(index)
  }

  private fun compressFormat(format: String, quality: Int): Bitmap.CompressFormat = when (format) {
    "png" -> Bitmap.CompressFormat.PNG
    "webp" -> if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      if (quality >= 100) Bitmap.CompressFormat.WEBP_LOSSLESS else Bitmap.CompressFormat.WEBP_LOSSY
    } else {
      @Suppress("DEPRECATION")
      Bitmap.CompressFormat.WEBP
    }
    else -> Bitmap.CompressFormat.JPEG
  }

  private fun writeBitmap(bitmap: Bitmap, outputUri: String, format: String, quality: Int) {
    val out = fileOf(outputUri)
    out.parentFile?.mkdirs()
    if (out.exists()) throw OutputExistsException()
    val ok = FileOutputStream(out).use { stream -> bitmap.compress(compressFormat(format, quality), quality.coerceIn(1, 100), stream) }
    if (!ok) {
      out.delete()
      throw EncodeFailedException()
    }
  }

  /** Bounds a size by its longest edge and total pixel count. */
  private fun bounded(width: Double, height: Double, maxEdge: Int, maxPixels: Int): Pair<Int, Int> {
    var scale = min(1.0, maxEdge / max(width, height))
    val pixels = width * scale * height * scale
    if (pixels > maxPixels) scale *= sqrt(maxPixels / pixels)
    return Pair(max(1, floor(width * scale).toInt()), max(1, floor(height * scale).toInt()))
  }

  private fun renderPage(o: RenderPageOptions): Map<String, Any> {
    openRenderer(o.inputUri).use { (renderer, _) ->
      checkPage(renderer, o.pageIndex)
      renderer.openPage(o.pageIndex).use { page ->
        // page.width/height are in points (1/72 inch); dpi chooses the pixel density.
        val (w, h) = bounded(page.width * o.dpi / 72.0, page.height * o.dpi / 72.0, o.maxEdge, o.maxPixels)
        val bitmap = try {
          Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
        } catch (e: OutOfMemoryError) {
          throw OutOfMemoryException()
        }
        try {
          // PdfRenderer draws on a transparent bitmap: paper is white.
          bitmap.eraseColor(Color.WHITE)
          page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
          writeBitmap(bitmap, o.outputUri, o.format, o.quality)
        } finally {
          bitmap.recycle()
        }
        return mapOf("width" to w, "height" to h)
      }
    }
  }

  private fun flatten(o: FlattenOptions): Map<String, Any> {
    val input = fileOf(o.inputUri)
    if (!input.exists()) throw FileMissingException()
    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    BitmapFactory.decodeFile(input.path, bounds)
    if (bounds.outWidth <= 0 || bounds.outHeight <= 0) throw DecodeFailedException()
    var sample = 1
    while ((bounds.outWidth / sample).toLong() * (bounds.outHeight / sample) > o.maxPixels) sample *= 2
    val decode = BitmapFactory.Options().apply {
      inSampleSize = sample
      inPreferredConfig = Bitmap.Config.ARGB_8888
    }
    val source = try {
      BitmapFactory.decodeFile(input.path, decode) ?: throw DecodeFailedException()
    } catch (e: OutOfMemoryError) {
      throw OutOfMemoryException()
    }
    try {
      val opaque = Bitmap.createBitmap(source.width, source.height, Bitmap.Config.ARGB_8888)
      try {
        val canvas = Canvas(opaque)
        canvas.drawColor(Color.parseColor(o.background))
        canvas.drawBitmap(source, 0f, 0f, Paint(Paint.FILTER_BITMAP_FLAG))
        writeBitmap(opaque, o.outputUri, "jpeg", (o.quality * 100).roundToInt())
        return mapOf("width" to opaque.width, "height" to opaque.height)
      } finally {
        opaque.recycle()
      }
    } finally {
      source.recycle()
    }
  }
}

class RenderPageOptions : Record {
  @Field val inputUri: String = ""
  @Field val pageIndex: Int = 0
  @Field val outputUri: String = ""
  /** "jpeg" | "png" | "webp" */
  @Field val format: String = "jpeg"
  /** 1..100 */
  @Field val quality: Int = 90
  @Field val dpi: Double = 150.0
  @Field val maxEdge: Int = 4096
  @Field val maxPixels: Int = 16_000_000
}

class FlattenOptions : Record {
  @Field val inputUri: String = ""
  @Field val outputUri: String = ""
  /** 0..1 */
  @Field val quality: Double = 0.9
  @Field val background: String = "#FFFFFF"
  @Field val maxPixels: Int = 40_000_000
}

internal class InvalidUriException(uri: String) : CodedException("ERR_INVALID_URI", "Only local file URIs are supported", null)
internal class FileMissingException : CodedException("ERR_FILE_MISSING", "The file does not exist", null)
internal class PdfPasswordException(cause: Throwable) : CodedException("ERR_PDF_PASSWORD", "The PDF is password protected", cause)
internal class PdfOpenException(cause: Throwable) : CodedException("ERR_PDF_OPEN", "The PDF could not be opened", cause)
internal class PageOutOfRangeException(index: Int) : CodedException("ERR_PAGE_RANGE", "Page $index is out of range", null)
internal class OutputExistsException : CodedException("ERR_OUTPUT_EXISTS", "The output file already exists", null)
internal class EncodeFailedException : CodedException("ERR_ENCODE", "The image could not be encoded", null)
internal class DecodeFailedException : CodedException("ERR_DECODE", "The image could not be decoded", null)
internal class OutOfMemoryException : CodedException("ERR_OUT_OF_MEMORY", "Not enough memory for this image", null)
