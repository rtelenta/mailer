### Requirement: live preview renders compiled HTML from mjml-browser
The template editor preview pane SHALL display the rendered HTML produced by `mjml-browser` whenever the MJML source changes. `compilePreview` MUST await the Promise returned by `mjml()` before reading `result.html` or `result.errors`.

#### Scenario: valid MJML source
- **WHEN** the MJML textarea contains valid MJML and the template has loaded
- **THEN** the preview pane SHALL display the compiled HTML within 300 ms of the last keystroke

#### Scenario: mjml returns errors
- **WHEN** `mjml()` resolves with a non-empty `errors` array
- **THEN** `compilePreview` SHALL return `{ html: "", error: <formatted messages> }` and the preview pane SHALL display the compilation error

#### Scenario: mjml resolves with no errors
- **WHEN** `mjml()` resolves with an empty or absent `errors` array
- **THEN** `compilePreview` SHALL return `{ html: result.html, error: null }`
