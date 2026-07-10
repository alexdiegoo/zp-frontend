// Pin the timezone so pt-BR Intl formatters and local-time date math are
// deterministic across machines/CI (SC-005). Set before any Date/Intl use.
process.env.TZ = "America/Sao_Paulo";

// Extends Jest's `expect` with DOM matchers (toBeInTheDocument, etc.).
import "@testing-library/jest-dom";
