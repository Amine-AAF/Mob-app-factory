# Keep BouncyCastle Argon2 classes used via the module (R8 would otherwise be free to rename them).
-keep class org.bouncycastle.crypto.generators.Argon2BytesGenerator { *; }
-keep class org.bouncycastle.crypto.params.Argon2Parameters { *; }
-keep class org.bouncycastle.crypto.params.Argon2Parameters$Builder { *; }
-dontwarn org.bouncycastle.**
