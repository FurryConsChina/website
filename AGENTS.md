# Code Guidelines

You must follow these rules strictly:

## PRIORITIZE SOUND SOLUTIONS

- First choose a solution that fully solves the problem and is clear, maintainable, and consistent with the codebase.
- Prefer smaller changes only when they do not make the solution worse. Minimal diffs are a tiebreaker, not the primary goal.
- Do not preserve awkward structure, duplication, or poor boundaries just to touch fewer lines.

## DO NOT OVER-SCOPE

- Only make changes that are directly requested or clearly necessary for a complete solution.
- Don't add unrelated features or speculative refactors. But if the cleanest correct fix requires changing adjacent code, make that change instead of forcing an awkward minimal patch.
- Don't add docstrings, comments, or type annotations to code you didn't change. Only add comments where the logic isn't self-evident.
- Don't use feature flags when you can just change the code.

## DO NOT OVER-ABSTRACT

- Keep implementation details private. If a type is only used internally by one module/class, nest it or keep it unexported — do not make it a separate public file.
- Do not create an abstraction (interface, trait, protocol, abstract class) that has exactly one implementation. That is not abstraction, it is indirection.
- Do not use heavyweight construction patterns (Builder, fluent config objects) unless the object has 5+ required fields or genuinely complex construction. Prefer simple constructors, factory functions, or struct/dict literals.
- Do not extract trivial one-liner methods that add no semantic value. If the method body is as clear as the method name, inline it.
- Don't create helpers, utilities, or abstractions for one-time operations. Don't design for hypothetical future requirements. Prefer the simplest design that solves the current task cleanly; three similar lines of code is better than a premature abstraction, but not if avoiding the abstraction makes the result more awkward.
- Fewer files with cohesive internals are better than many files with thin wrappers.
- Prefer composable, open designs (callbacks, lambdas, higher-order functions, strategy objects) over closed configuration (boolean toggles, enum switches for a fixed set of options). When the task asks for "configurable rules," deliver composable rules — not a fixed list of on/off flags.

## DO NOT OVER-DEFEND

- Only add defensive checks (null/nil/None checks, type guards, boundary validation) at true system boundaries — public API entry points that accept external, untrusted input.
- Do not add defensive checks in internal/private functions, constructors called only by your own code, or test helpers.
- Do not add defensive copies unless the data is genuinely shared across trust boundaries.
- Omitting a defensive check is not a bug — it is a deliberate signal that the caller is trusted.

## USE MODERN LANGUAGE FEATURES

- Write idiomatic code for the language version specified by the project. Do not write code that targets an older version out of habit.
- Prefer language-level constructs that reduce boilerplate: pattern matching, destructuring, algebraic data types (sealed types, tagged unions, enums with data), data classes/records/structs, and built-in concurrency primitives.
- If the language provides exhaustiveness checking (e.g., sealed types + switch, match expressions, tagged unions), use it. Compiler-enforced completeness is better than a default/else branch that hides missing cases.
- Do not manually write what the language generates for free (toString, equality, hash, serialization).

## RESPECT THE EXISTING CODEBASE

- Before writing new code, read the surrounding module to understand its conventions: error handling style, dependency injection approach, module organization, test patterns, naming idioms.
- Reuse existing utilities, helpers, and internal patterns. Do not introduce a "locally better but globally alien" approach when the project already has an established way to do the same thing.
- Your code should look like it was written by someone who already works on this project. If placed anonymously into the repository, a project-familiar reviewer should not find it stylistically jarring.
- Do not introduce new libraries, frameworks, paradigms, or organizational patterns unless the task explicitly requires it and no existing project convention covers the need.
- When removing code, remove it completely: no compatibility shims, no re-exports of old names, no `// removed` comments, no dead forwarding layers kept "just in case." If it is unused, delete it.
- When refactoring, do not preserve intermediate layers solely to avoid updating call sites. Update the call sites.

## WRITE MEANINGFUL TESTS

- Do not write tests unless the user explicitly asks for them.
- Test the interesting behavior, not the trivial paths. Prioritize edge cases, error conditions, and concurrency scenarios over "happy path only" coverage.
- Structure test output so that individual failures are identifiable — do not let the first assertion crash the entire suite with no indication of what else passed or failed.
- If the implementation supports a feature (cancellation, composition, error recovery), test it.