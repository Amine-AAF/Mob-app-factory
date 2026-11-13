package expo.modules.safevault

import android.app.KeyguardManager
import android.content.ClipData
import android.content.ClipDescription
import android.content.ClipboardManager
import android.content.Context
import android.os.Build
import android.os.PersistableBundle
import android.util.Base64
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.bouncycastle.crypto.generators.Argon2BytesGenerator
import org.bouncycastle.crypto.params.Argon2Parameters

/**
 * SafeVault native helpers. Nothing here touches the network or writes to disk.
 *
 * - Argon2id key derivation with BouncyCastle (maintained, widely reviewed JVM implementation),
 *   run on a background dispatcher. JS checks the output against a known-answer test at
 *   start-up before trusting it (see src/crypto/kdf.ts).
 * - Clipboard copies flagged as sensitive, and label-checked clearing so we never wipe
 *   something the user copied from another app afterwards.
 * - Device lock-screen status (biometric unlock is only offered on secure devices).
 *
 * Secrets are never logged. Byte arrays holding the password are zeroed after use.
 */
class SafeVaultNativeModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw CodedException("ERR_NO_CONTEXT", "React context unavailable", null)

  override fun definition() = ModuleDefinition {
    Name("SafeVaultNative")

    AsyncFunction("argon2id") Coroutine { passwordB64: String, saltB64: String, memoryKiB: Int, iterations: Int, parallelism: Int, length: Int ->
      withContext(Dispatchers.Default) { argon2id(passwordB64, saltB64, memoryKiB, iterations, parallelism, length) }
    }

    AsyncFunction("copySensitive") { text: String, label: String, promise: Promise ->
      val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
      val clip = ClipData.newPlainText(label, text)
      val extras = PersistableBundle()
      if (Build.VERSION.SDK_INT >= 33) {
        extras.putBoolean(ClipDescription.EXTRA_IS_SENSITIVE, true)
      } else {
        // Same key, honoured by some OEM keyboards / clipboard managers before API 33.
        extras.putBoolean("android.content.extra.IS_SENSITIVE", true)
      }
      clip.description.extras = extras
      cm.setPrimaryClip(clip)
      promise.resolve(null)
    }.runOnQueue(Queues.MAIN)

    AsyncFunction("clearClipboardIfLabel") { label: String, promise: Promise ->
      val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
      // Reading the description (not the clip content) does not trigger Android 12+'s paste toast.
      val current = cm.primaryClipDescription?.label?.toString()
      if (current != null && current == label) {
        if (Build.VERSION.SDK_INT >= 28) cm.clearPrimaryClip() else cm.setPrimaryClip(ClipData.newPlainText("", ""))
        promise.resolve(true)
      } else {
        promise.resolve(false)
      }
    }.runOnQueue(Queues.MAIN)

    Function("isDeviceSecure") {
      val km = context.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
      km.isDeviceSecure
    }
  }

  private fun argon2id(passwordB64: String, saltB64: String, memoryKiB: Int, iterations: Int, parallelism: Int, length: Int): String {
    // Bounds are also enforced in JS; re-checked here so the native API is safe on its own.
    if (memoryKiB < 8 * parallelism || memoryKiB > 1_048_576 || iterations < 1 || iterations > 20 || parallelism < 1 || parallelism > 8 || length < 16 || length > 64) {
      throw CodedException("ERR_KDF_PARAMS", "Invalid Argon2 parameters", null)
    }
    val password = Base64.decode(passwordB64, Base64.NO_WRAP)
    val salt = Base64.decode(saltB64, Base64.NO_WRAP)
    val out = ByteArray(length)
    try {
      val params = Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
        .withVersion(Argon2Parameters.ARGON2_VERSION_13)
        .withIterations(iterations)
        .withMemoryAsKB(memoryKiB)
        .withParallelism(parallelism)
        .withSalt(salt)
        .build()
      val generator = Argon2BytesGenerator()
      generator.init(params)
      generator.generateBytes(password, out)
      params.clear()
      return Base64.encodeToString(out, Base64.NO_WRAP)
    } catch (e: OutOfMemoryError) {
      throw CodedException("ERR_KDF_MEMORY", "Not enough memory for key derivation", null)
    } finally {
      password.fill(0)
      out.fill(0)
    }
  }
}
