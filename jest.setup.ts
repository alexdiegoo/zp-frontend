// Pin the timezone so pt-BR Intl formatters and local-time date math are
// deterministic across machines/CI (SC-005). The authoritative pin is the
// `TZ=America/Sao_Paulo` prefix on the `test` scripts in package.json — it must
// be set BEFORE Node boots, because V8 caches the ICU default timezone on the
// first Date/Intl use (which happens during Jest's environment bootstrap, well
// before this file runs). Assigning process.env.TZ here is too late to change
// that cached zone, so it's kept only as a documentation/fallback marker.
process.env.TZ = "America/Sao_Paulo";

// Extends Jest's `expect` with DOM matchers (toBeInTheDocument, etc.).
import "@testing-library/jest-dom";
