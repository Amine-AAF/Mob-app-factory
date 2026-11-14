package expo.modules.imagecraft

import android.content.ContentValues
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.RadialGradient
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface
import android.media.ExifInterface
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.util.concurrent.ConcurrentHashMap
import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * ImageCraft's on-device rendering engine. Everything runs locally on a background
 * dispatcher with android.graphics only: no network, no third-party library.
 *
 * A render executes a recipe computed (and unit-tested) in TypeScript:
 *   decode (sampled to the needed resolution, EXIF orientation applied)
 *   -> quarter-turn rotation + flips -> crop -> scale into the destination rectangle
 *   -> colour matrix -> blur / sharpen / vignette -> text layers -> watermark -> encode.
 *
 * Memory: the source is decoded with inSampleSize so it never exceeds the pixel budget,
 * all geometry is applied in a single matrix draw (no intermediate full-size copies),
 * and every bitmap is recycled as soon as possible. OutOfMemoryError is reported as a
 * coded error so the UI can suggest a smaller output instead of crashing.
 */
class ImageCraftNativeModule : Module() {
  private val cancelled: MutableSet<String> = ConcurrentHashMap.newKeySet()

  override fun definition() = ModuleDefinition {
    Name("ImageCraftNative")

    AsyncFunction("render") Coroutine { recipe: RenderRecipe ->
      withContext(Dispatchers.Default) {
        try { render(recipe) } finally { cancelled.remove(recipe.jobId) }
      }
    }

    AsyncFunction("renderCollage") Coroutine { spec: CollageSpec ->
      withContext(Dispatchers.Default) {
        try { renderCollage(spec) } finally { cancelled.remove(spec.jobId) }
      }
    }

    AsyncFunction("saveToGallery") Coroutine { uri: String, displayName: String, mimeType: String ->
      withContext(Dispatchers.IO) { saveToGallery(uri, displayName, mimeType) }
    }

    Function("cancel") { jobId: String ->
      if (jobId.isNotEmpty()) cancelled.add(jobId)
      Unit
    }
  }

  /* ------------------------------------------------------------------ files */

  private fun fileOf(uri: String): File {
    val parsed = Uri.parse(uri)
    val path = if (parsed.scheme == "file") parsed.path else if (parsed.scheme == null) uri else null
    if (path == null) throw InvalidUriException()
    return File(path)
  }

  private fun checkCancelled(jobId: String) {
    if (jobId.isNotEmpty() && cancelled.contains(jobId)) throw CancelledException()
  }

  /* ------------------------------------------------------------------ decoding */

  private class Decoded(val bitmap: Bitmap, val orientation: Matrix)

  private fun exifMatrix(file: File): Matrix {
    val m = Matrix()
    val orientation = try {
      ExifInterface(file.path).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)
    } catch (_: Throwable) {
      ExifInterface.ORIENTATION_NORMAL
    }
    when (orientation) {
      ExifInterface.ORIENTATION_FLIP_HORIZONTAL -> m.setScale(-1f, 1f)
      ExifInterface.ORIENTATION_ROTATE_180 -> m.setRotate(180f)
      ExifInterface.ORIENTATION_FLIP_VERTICAL -> { m.setRotate(180f); m.postScale(-1f, 1f) }
      ExifInterface.ORIENTATION_TRANSPOSE -> { m.setRotate(90f); m.postScale(-1f, 1f) }
      ExifInterface.ORIENTATION_ROTATE_90 -> m.setRotate(90f)
      ExifInterface.ORIENTATION_TRANSVERSE -> { m.setRotate(-90f); m.postScale(-1f, 1f) }
      ExifInterface.ORIENTATION_ROTATE_270 -> m.setRotate(-90f)
    }
    return m
  }

  /** Stored (not oriented) dimensions. */
  private fun bounds(file: File): Pair<Int, Int> {
    if (!file.exists()) throw FileMissingException()
    val o = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    BitmapFactory.decodeFile(file.path, o)
    if (o.outWidth <= 0 || o.outHeight <= 0) throw DecodeFailedException()
    return Pair(o.outWidth, o.outHeight)
  }

  /**
   * Decodes with the largest power-of-two sample that still provides at least
   * `neededScale` of the stored resolution, within the pixel budget.
   */
  private fun decode(file: File, neededScale: Double, maxPixels: Long): Decoded {
    val (w, h) = bounds(file)
    var sample = 1
    while (sample < 64 && 1.0 / (sample * 2) >= neededScale) sample *= 2
    while ((w.toLong() / sample) * (h.toLong() / sample) > maxPixels) sample *= 2
    var attempt = 0
    while (true) {
      val options = BitmapFactory.Options().apply {
        inSampleSize = sample
        inPreferredConfig = Bitmap.Config.ARGB_8888
      }
      try {
        val bitmap = BitmapFactory.decodeFile(file.path, options) ?: throw DecodeFailedException()
        return Decoded(bitmap, exifMatrix(file))
      } catch (e: OutOfMemoryError) {
        attempt++
        if (attempt > 2) throw OutOfMemoryException()
        sample *= 2
      }
    }
  }

  /** Translates a linear (origin-based) matrix so the mapped bitmap starts at (0,0). Returns the mapped size. */
  private fun normalize(m: Matrix, w: Float, h: Float): RectF {
    val r = RectF(0f, 0f, w, h)
    m.mapRect(r)
    m.postTranslate(-r.left, -r.top)
    return RectF(0f, 0f, r.width(), r.height())
  }

  /**
   * Draws a source picture (oriented, rotated, flipped, cropped) into `dst`.
   * All geometry is folded into ONE matrix applied in a single draw.
   */
  private fun drawSource(
    canvas: Canvas,
    uri: String,
    geometry: GeometryRec?,
    dst: RectF,
    paint: Paint,
    maxPixels: Long,
    jobId: String,
  ) {
    val file = fileOf(uri)
    val (sw, sh) = bounds(file)
    val rotation = ((geometry?.rotation ?: 0) % 4 + 4) % 4
    val crop = geometry?.crop
    val cw = (crop?.width ?: 1.0).coerceIn(0.0001, 1.0)
    val ch = (crop?.height ?: 1.0).coerceIn(0.0001, 1.0)
    // Size of the crop in STORED pixels (EXIF and quarter turns may swap the axes).
    val oriented = RectF(0f, 0f, sw.toFloat(), sh.toFloat())
    exifMatrix(file).mapRect(oriented)
    val rw = if (rotation % 2 == 1) oriented.height() else oriented.width()
    val rh = if (rotation % 2 == 1) oriented.width() else oriented.height()
    val needed = max(dst.width() / (rw * cw), dst.height() / (rh * ch))
    val decoded = decode(file, min(1.0, needed * 1.05), maxPixels)
    checkCancelled(jobId)
    try {
      val bw = decoded.bitmap.width.toFloat()
      val bh = decoded.bitmap.height.toFloat()
      val m = Matrix(decoded.orientation)
      if (rotation != 0) m.postRotate(90f * rotation)
      if (geometry?.flipH == true) m.postScale(-1f, 1f)
      if (geometry?.flipV == true) m.postScale(1f, -1f)
      val space = normalize(m, bw, bh)
      val cx = ((crop?.x ?: 0.0) * space.width()).toFloat()
      val cy = ((crop?.y ?: 0.0) * space.height()).toFloat()
      val cropW = (cw * space.width()).toFloat()
      val cropH = (ch * space.height()).toFloat()
      m.postTranslate(-cx, -cy)
      m.postScale(dst.width() / cropW, dst.height() / cropH)
      m.postTranslate(dst.left, dst.top)
      canvas.drawBitmap(decoded.bitmap, m, paint)
    } finally {
      decoded.bitmap.recycle()
    }
  }

  /* ------------------------------------------------------------------ effects */

  private fun pictureRegion(outW: Int, outH: Int, dst: RectF): Rect {
    val r = Rect(max(0, dst.left.toInt()), max(0, dst.top.toInt()), min(outW, ceil(dst.right.toDouble()).toInt()), min(outH, ceil(dst.bottom.toDouble()).toInt()))
    return if (r.width() > 0 && r.height() > 0) r else Rect(0, 0, outW, outH)
  }

  /** Cheap, memory-light blur: downscale then upscale with bilinear filtering (approximates a Gaussian). */
  private fun blur(out: Bitmap, region: Rect, amount: Double) {
    if (amount <= 0) return
    val factor = 1.0 + amount / 100.0 * 23.0 // 1x .. 24x
    val sw = max(1, (region.width() / factor).roundToInt())
    val sh = max(1, (region.height() / factor).roundToInt())
    val part = Bitmap.createBitmap(out, region.left, region.top, region.width(), region.height())
    val small = Bitmap.createScaledBitmap(part, sw, sh, true)
    part.recycle()
    // SRC replaces the region (alpha included) instead of compositing over the sharp pixels.
    val paint = Paint(Paint.FILTER_BITMAP_FLAG).apply { xfermode = PorterDuffXfermode(PorterDuff.Mode.SRC) }
    Canvas(out).drawBitmap(small, null, region, paint)
    small.recycle()
  }

  /** 3x3 sharpen kernel processed in horizontal strips to bound memory. */
  private fun sharpen(out: Bitmap, region: Rect, amount: Double, jobId: String) {
    if (amount <= 0) return
    val a = (amount / 100.0 * 1.2).toFloat()
    val w = region.width()
    val h = region.height()
    val strip = 128
    var prev = IntArray(w)
    out.getPixels(prev, 0, w, region.left, region.top, w, 1)
    var y = 0
    while (y < h) {
      checkCancelled(jobId)
      val rows = min(strip, h - y)
      val readTop = y
      val readRows = min(rows + 1, h - y)
      val src = IntArray(w * readRows)
      out.getPixels(src, 0, w, region.left, region.top + readTop, w, readRows)
      val dst = IntArray(w * rows)
      for (r in 0 until rows) {
        val cur = r * w
        val up = if (r == 0) null else (r - 1) * w
        val down = if (r + 1 < readRows) (r + 1) * w else cur
        for (x in 0 until w) {
          val c = src[cur + x]
          val l = src[cur + max(0, x - 1)]
          val rr = src[cur + min(w - 1, x + 1)]
          val u = if (up == null) prev[x] else src[up + x]
          val d = src[down + x]
          fun ch(shift: Int): Int {
            val cc = (c shr shift) and 0xff
            val sum = ((l shr shift) and 0xff) + ((rr shr shift) and 0xff) + ((u shr shift) and 0xff) + ((d shr shift) and 0xff)
            return (cc + a * (4 * cc - sum)).roundToInt().coerceIn(0, 255)
          }
          dst[cur + x] = (c and ALPHA_MASK) or (ch(16) shl 16) or (ch(8) shl 8) or ch(0)
        }
      }
      // Keep the ORIGINAL last row of this strip as the "up" neighbour of the next one.
      prev = src.copyOfRange((rows - 1) * w, rows * w)
      out.setPixels(dst, 0, w, region.left, region.top + y, w, rows)
      y += rows
    }
  }

  private fun vignette(canvas: Canvas, region: Rect, amount: Double) {
    if (amount <= 0) return
    val cx = region.exactCenterX()
    val cy = region.exactCenterY()
    val radius = hypot(region.width().toFloat(), region.height().toFloat()) / 2f
    val alpha = (amount / 100.0 * 0.8 * 255).roundToInt().coerceIn(0, 255)
    val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    paint.shader = RadialGradient(cx, cy, radius, intArrayOf(Color.TRANSPARENT, Color.TRANSPARENT, Color.argb(alpha, 0, 0, 0)), floatArrayOf(0f, 0.45f, 1f), Shader.TileMode.CLAMP)
    canvas.save()
    canvas.clipRect(region)
    canvas.drawRect(RectF(region), paint)
    canvas.restore()
  }

  /* ------------------------------------------------------------------ overlays */

  private fun parseColor(hex: String, fallback: Int): Int = try { Color.parseColor(hex) } catch (_: Throwable) { fallback }

  private fun typeface(family: String, bold: Boolean): Typeface = Typeface.create(family, if (bold) Typeface.BOLD else Typeface.NORMAL)

  private fun textPaint(color: String, opacity: Double, size: Float, family: String, bold: Boolean, shadow: Boolean): Paint {
    val p = Paint(Paint.ANTI_ALIAS_FLAG or Paint.SUBPIXEL_TEXT_FLAG)
    p.color = parseColor(color, Color.WHITE)
    p.alpha = (opacity.coerceIn(0.0, 1.0) * 255).roundToInt()
    p.textSize = max(1f, size)
    p.typeface = typeface(family, bold)
    if (shadow) p.setShadowLayer(size * 0.08f, size * 0.04f, size * 0.04f, Color.argb((p.alpha * 0.6).roundToInt(), 0, 0, 0))
    return p
  }

  /** Draws a (multi-line) text block centred on (0,0) of the current canvas transform. */
  private fun drawTextBlock(canvas: Canvas, text: String, paint: Paint, align: String) {
    val lines = text.split('\n')
    val fm = paint.fontMetrics
    val lineHeight = (fm.descent - fm.ascent) * 1.1f
    val widths = lines.map { paint.measureText(it) }
    val blockW = widths.maxOrNull() ?: 0f
    val blockH = lineHeight * lines.size
    paint.textAlign = when (align) { "left" -> Paint.Align.LEFT; "right" -> Paint.Align.RIGHT; else -> Paint.Align.CENTER }
    val x = when (align) { "left" -> -blockW / 2f; "right" -> blockW / 2f; else -> 0f }
    var baseline = -blockH / 2f - fm.ascent
    for (line in lines) {
      canvas.drawText(line, x, baseline, paint)
      baseline += lineHeight
    }
  }

  private fun drawTexts(canvas: Canvas, texts: List<TextRec>, outW: Int, outH: Int) {
    for (t in texts) {
      if (t.text.isBlank()) continue
      val paint = textPaint(t.color, t.opacity, (t.size * outW).toFloat(), t.font, t.bold, t.shadow)
      canvas.save()
      canvas.translate((t.x * outW).toFloat(), (t.y * outH).toFloat())
      canvas.rotate(t.rotation.toFloat())
      drawTextBlock(canvas, t.text, paint, t.align)
      canvas.restore()
    }
  }

  private fun anchorCenter(anchor: String, outW: Int, outH: Int, markW: Float, markH: Float): Pair<Float, Float> {
    val margin = min(outW, outH) * 0.04f
    val x = when {
      anchor.endsWith("left") || anchor == "left" -> margin + markW / 2f
      anchor.endsWith("right") || anchor == "right" -> outW - margin - markW / 2f
      else -> outW / 2f
    }
    val y = when {
      anchor.startsWith("top") -> margin + markH / 2f
      anchor.startsWith("bottom") -> outH - margin - markH / 2f
      else -> outH / 2f
    }
    return Pair(x, y)
  }

  private fun drawWatermark(canvas: Canvas, wm: WatermarkRec, outW: Int, outH: Int, maxPixels: Long) {
    val logoUri = wm.logoUri
    if (wm.kind == "logo" && !logoUri.isNullOrEmpty()) {
      val file = fileOf(logoUri)
      val targetW = (wm.size * outW).toFloat().coerceAtLeast(1f)
      val (lw, lh) = bounds(file)
      val decoded = decode(file, min(1.0, targetW / max(lw, lh) * 1.05), min(maxPixels, 4_000_000L))
      val logo: Bitmap = decoded.bitmap
      try {
        val m = Matrix(decoded.orientation)
        val space = normalize(m, logo.width.toFloat(), logo.height.toFloat())
        val s = targetW / space.width()
        m.postScale(s, s)
        val markH = space.height() * s
        val paint = Paint(Paint.FILTER_BITMAP_FLAG or Paint.ANTI_ALIAS_FLAG)
        paint.alpha = (wm.opacity.coerceIn(0.0, 1.0) * 255).roundToInt()
        placeMarks(canvas, wm, outW, outH, targetW, markH) {
          canvas.translate(-targetW / 2f, -markH / 2f)
          canvas.drawBitmap(logo, m, paint)
        }
      } finally {
        logo.recycle()
      }
      return
    }
    if (wm.text.isBlank()) return
    val paint = textPaint(wm.color, wm.opacity, (wm.size * outW).toFloat(), "sans-serif-medium", true, true)
    val lines = wm.text.split('\n')
    val fm = paint.fontMetrics
    val markW = lines.maxOf { paint.measureText(it) }
    val markH = (fm.descent - fm.ascent) * 1.1f * lines.size
    placeMarks(canvas, wm, outW, outH, markW, markH) { drawTextBlock(canvas, wm.text, paint, "center") }
  }

  /** Calls `draw` with the canvas centred on each mark position (single anchor or diagonal tiling). */
  private fun placeMarks(canvas: Canvas, wm: WatermarkRec, outW: Int, outH: Int, markW: Float, markH: Float, draw: () -> Unit) {
    val drawMarkAt = { cx: Float, cy: Float ->
      canvas.save()
      canvas.translate(cx, cy)
      draw()
      canvas.restore()
    }
    run {
      if (wm.tiled) {
        val stepX = markW * 1.8f + outW * 0.05f
        val stepY = markH * 3f + outH * 0.05f
        val diag = hypot(outW.toFloat(), outH.toFloat())
        canvas.save()
        canvas.rotate(-30f, outW / 2f, outH / 2f)
        var y = outH / 2f - diag
        var row = 0
        while (y < outH / 2f + diag) {
          var x = outW / 2f - diag + if (row % 2 == 0) 0f else stepX / 2f
          while (x < outW / 2f + diag) {
            drawMarkAt(x, y)
            x += stepX
          }
          y += stepY
          row++
        }
        canvas.restore()
      } else {
        val (cx, cy) = anchorCenter(wm.anchor, outW, outH, markW, markH)
        drawMarkAt(cx, cy)
      }
    }
  }

  /* ------------------------------------------------------------------ encoding */

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

  /** True only when the platform encoder really writes a lossless file for these settings. */
  private fun isLossless(format: String, quality: Int): Boolean = when (format) {
    "png" -> true
    // Before Android 10 the legacy WEBP encoder is lossy even at quality 100.
    "webp" -> quality >= 100 && Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
    else -> false
  }

  private fun encode(bitmap: Bitmap, outputUri: String, format: String, quality: Int): Map<String, Any> {
    val out = fileOf(outputUri)
    out.parentFile?.mkdirs()
    if (out.exists()) throw OutputExistsException()
    val q = quality.coerceIn(1, 100)
    val ok = try {
      FileOutputStream(out).use { stream -> bitmap.compress(compressFormat(format, q), q, stream) }
    } catch (e: Throwable) {
      out.delete()
      if ((e.message ?: "").contains("ENOSPC")) throw StorageFullException()
      throw EncodeFailedException()
    }
    if (!ok || out.length() == 0L) {
      out.delete()
      throw EncodeFailedException()
    }
    return mapOf("uri" to outputUri, "width" to bitmap.width, "height" to bitmap.height, "bytes" to out.length().toDouble(), "format" to format, "lossless" to isLossless(format, q))
  }

  private fun createOutput(w: Int, h: Int): Bitmap {
    if (w <= 0 || h <= 0 || w.toLong() * h > MAX_OUTPUT_PIXELS) throw OutOfMemoryException()
    return try { Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888) } catch (e: OutOfMemoryError) { throw OutOfMemoryException() }
  }

  /* ------------------------------------------------------------------ render */

  private fun render(r: RenderRecipe): Map<String, Any> {
    checkCancelled(r.jobId)
    val canvasRec = r.canvas
    val outW = canvasRec?.width ?: r.size.width
    val outH = canvasRec?.height ?: r.size.height
    val out = createOutput(outW, outH)
    try {
      val canvas = Canvas(out)
      val dst = if (canvasRec != null) RectF(canvasRec.image.x.toFloat(), canvasRec.image.y.toFloat(), (canvasRec.image.x + canvasRec.image.width).toFloat(), (canvasRec.image.y + canvasRec.image.height).toFloat())
      else RectF(0f, 0f, outW.toFloat(), outH.toFloat())
      when {
        canvasRec != null -> canvas.drawColor(parseColor(canvasRec.background, Color.WHITE))
        r.encode.format == "jpeg" -> canvas.drawColor(parseColor(r.encode.flattenBackground, Color.WHITE))
        else -> canvas.drawColor(Color.TRANSPARENT, PorterDuff.Mode.CLEAR)
      }
      val paint = Paint(Paint.FILTER_BITMAP_FLAG or Paint.ANTI_ALIAS_FLAG or Paint.DITHER_FLAG)
      r.colorMatrix?.takeIf { it.size == 20 }?.let { values -> paint.colorFilter = ColorMatrixColorFilter(ColorMatrix(values.map { it.toFloat() }.toFloatArray())) }
      drawSource(canvas, r.inputUri, r.geometry, dst, paint, r.maxDecodePixels.toLong(), r.jobId)
      checkCancelled(r.jobId)
      val region = pictureRegion(outW, outH, dst)
      blur(out, region, r.blur)
      checkCancelled(r.jobId)
      sharpen(out, region, r.sharpness, r.jobId)
      vignette(canvas, region, r.vignette)
      drawTexts(canvas, r.texts, outW, outH)
      r.watermark?.let { drawWatermark(canvas, it, outW, outH, r.maxDecodePixels.toLong()) }
      checkCancelled(r.jobId)
      return encode(out, r.outputUri, r.encode.format, r.encode.quality)
    } finally {
      out.recycle()
    }
  }

  private fun renderCollage(s: CollageSpec): Map<String, Any> {
    checkCancelled(s.jobId)
    val out = createOutput(s.width, s.height)
    try {
      val canvas = Canvas(out)
      canvas.drawColor(parseColor(s.background, Color.WHITE))
      val paint = Paint(Paint.FILTER_BITMAP_FLAG or Paint.ANTI_ALIAS_FLAG or Paint.DITHER_FLAG)
      for (cell in s.cells) {
        checkCancelled(s.jobId)
        val rect = RectF(cell.x.toFloat(), cell.y.toFloat(), (cell.x + cell.width).toFloat(), (cell.y + cell.height).toFloat())
        canvas.save()
        if (s.radius > 0) {
          val path = Path()
          path.addRoundRect(rect, s.radius.toFloat(), s.radius.toFloat(), Path.Direction.CW)
          canvas.clipPath(path)
        } else {
          canvas.clipRect(rect)
        }
        if (cell.uri.isNullOrEmpty()) {
          canvas.drawColor(parseColor(s.placeholder, Color.LTGRAY))
        } else {
          val img = cell.image
          val dst = RectF(img.x.toFloat(), img.y.toFloat(), (img.x + img.width).toFloat(), (img.y + img.height).toFloat())
          drawSource(canvas, cell.uri!!, null, dst, paint, s.maxDecodePixels.toLong(), s.jobId)
        }
        canvas.restore()
      }
      return encode(out, s.outputUri, s.encode.format, s.encode.quality)
    } finally {
      out.recycle()
    }
  }

  /* ------------------------------------------------------------------ gallery */

  /** Adds a COPY to the shared gallery (Pictures/ImageCraft). Android 10+ needs no permission for this. */
  private fun saveToGallery(uri: String, displayName: String, mimeType: String): String {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) throw GalleryUnsupportedException()
    val context = appContext.reactContext ?: throw GalleryUnsupportedException()
    val source = fileOf(uri)
    if (!source.exists()) throw FileMissingException()
    val resolver = context.contentResolver
    val values = ContentValues().apply {
      put(MediaStore.Images.Media.DISPLAY_NAME, displayName)
      put(MediaStore.Images.Media.MIME_TYPE, mimeType)
      put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/ImageCraft")
      put(MediaStore.Images.Media.IS_PENDING, 1)
    }
    val collection = MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
    val item = resolver.insert(collection, values) ?: throw GalleryWriteException()
    try {
      resolver.openOutputStream(item)?.use { output -> FileInputStream(source).use { input -> input.copyTo(output) } } ?: throw GalleryWriteException()
      values.clear()
      values.put(MediaStore.Images.Media.IS_PENDING, 0)
      resolver.update(item, values, null, null)
      return item.toString()
    } catch (e: Throwable) {
      resolver.delete(item, null, null)
      if (e is CodedException) throw e
      throw GalleryWriteException()
    }
  }

  companion object {
    /** Absolute ceiling, whatever JS asks (100 MP = 400 MB of ARGB). */
    const val MAX_OUTPUT_PIXELS = 100_000_000L
    const val ALPHA_MASK: Int = -0x1000000 // 0xFF000000
  }
}

/* ---------------------------------------------------------------------- records */

class SizeRec : Record {
  @Field val width: Int = 1
  @Field val height: Int = 1
}

class NormRectRec : Record {
  @Field val x: Double = 0.0
  @Field val y: Double = 0.0
  @Field val width: Double = 1.0
  @Field val height: Double = 1.0
}

class PixelRectRec : Record {
  @Field val x: Double = 0.0
  @Field val y: Double = 0.0
  @Field val width: Double = 1.0
  @Field val height: Double = 1.0
}

class GeometryRec : Record {
  @Field val rotation: Int = 0
  @Field val flipH: Boolean = false
  @Field val flipV: Boolean = false
  @Field val crop: NormRectRec? = null
}

class CanvasRec : Record {
  @Field val width: Int = 1
  @Field val height: Int = 1
  @Field val background: String = "#FFFFFF"
  @Field val image: PixelRectRec = PixelRectRec()
}

class TextRec : Record {
  @Field val text: String = ""
  @Field val x: Double = 0.5
  @Field val y: Double = 0.5
  @Field val size: Double = 0.06
  @Field val color: String = "#FFFFFF"
  @Field val font: String = "sans-serif"
  @Field val bold: Boolean = false
  @Field val align: String = "center"
  @Field val rotation: Double = 0.0
  @Field val opacity: Double = 1.0
  @Field val shadow: Boolean = false
}

class WatermarkRec : Record {
  @Field val kind: String = "text"
  @Field val text: String = ""
  @Field val logoUri: String? = null
  @Field val anchor: String = "bottom-right"
  @Field val size: Double = 0.2
  @Field val opacity: Double = 0.5
  @Field val color: String = "#FFFFFF"
  @Field val tiled: Boolean = false
}

class EncodeRec : Record {
  @Field val format: String = "jpeg"
  @Field val quality: Int = 90
  @Field val flattenBackground: String = "#FFFFFF"
}

class RenderRecipe : Record {
  @Field val jobId: String = ""
  @Field val inputUri: String = ""
  @Field val outputUri: String = ""
  @Field val geometry: GeometryRec = GeometryRec()
  @Field val size: SizeRec = SizeRec()
  @Field val colorMatrix: List<Double>? = null
  @Field val sharpness: Double = 0.0
  @Field val blur: Double = 0.0
  @Field val vignette: Double = 0.0
  @Field val canvas: CanvasRec? = null
  @Field val texts: List<TextRec> = emptyList()
  @Field val watermark: WatermarkRec? = null
  @Field val encode: EncodeRec = EncodeRec()
  @Field val maxDecodePixels: Double = 24_000_000.0
}

class CollageCellRec : Record {
  @Field val x: Double = 0.0
  @Field val y: Double = 0.0
  @Field val width: Double = 1.0
  @Field val height: Double = 1.0
  @Field val uri: String? = null
  /** Destination of the whole picture (cover placement), in canvas pixels. */
  @Field val image: PixelRectRec = PixelRectRec()
}

class CollageSpec : Record {
  @Field val jobId: String = ""
  @Field val outputUri: String = ""
  @Field val width: Int = 1
  @Field val height: Int = 1
  @Field val background: String = "#FFFFFF"
  @Field val placeholder: String = "#DDDDDD"
  @Field val radius: Double = 0.0
  @Field val cells: List<CollageCellRec> = emptyList()
  @Field val encode: EncodeRec = EncodeRec()
  @Field val maxDecodePixels: Double = 12_000_000.0
}

/* ---------------------------------------------------------------------- errors */

internal class InvalidUriException : CodedException("ERR_INVALID_URI", "Only local file URIs are supported", null)
internal class FileMissingException : CodedException("ERR_FILE_MISSING", "The file does not exist", null)
internal class OutputExistsException : CodedException("ERR_OUTPUT_EXISTS", "The output file already exists", null)
internal class EncodeFailedException : CodedException("ERR_ENCODE", "The image could not be encoded", null)
internal class DecodeFailedException : CodedException("ERR_DECODE", "The image could not be decoded", null)
internal class OutOfMemoryException : CodedException("ERR_OUT_OF_MEMORY", "Not enough memory for this image", null)
internal class StorageFullException : CodedException("ERR_STORAGE_FULL", "Not enough storage space", null)
internal class CancelledException : CodedException("ERR_CANCELLED", "The operation was cancelled", null)
internal class GalleryUnsupportedException : CodedException("ERR_GALLERY_UNSUPPORTED", "Saving to the gallery needs Android 10 or later", null)
internal class GalleryWriteException : CodedException("ERR_GALLERY_WRITE", "The image could not be added to the gallery", null)
