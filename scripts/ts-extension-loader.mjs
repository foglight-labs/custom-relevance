/**
 * Node's native TS loader requires explicit file extensions on relative
 * imports, but the app's source (like the rest of the codebase) is written
 * extensionless for the bundler's resolver. This hook retries a failed
 * relative-import resolution with .ts/.mts/.tsx (and their /index variants)
 * appended, so `scripts/seed-collection.mts` can import straight from `src/`
 * without the app's source needing to change.
 */
const CANDIDATE_SUFFIXES = [".ts", ".mts", ".tsx", "/index.ts", "/index.mts"];

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    const isRelative = specifier.startsWith("./") || specifier.startsWith("../");
    const retryable = err?.code === "ERR_MODULE_NOT_FOUND" || err?.code === "ERR_UNSUPPORTED_DIR_IMPORT";
    if (!isRelative || !retryable) throw err;

    for (const suffix of CANDIDATE_SUFFIXES) {
      try {
        return await nextResolve(specifier + suffix, context);
      } catch {
        // keep trying the remaining suffixes
      }
    }
    throw err;
  }
}
