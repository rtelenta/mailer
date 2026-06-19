# mjml-template-editor (delta)

Delta spec — additions only. Merges into `openspec/specs/mjml-template-editor/spec.md`.

## Additional Functional Requirements

### AR-2: Send Test Email Action
- The editor header MUST include a "Send Test" button
- Clicking the button MUST POST to `POST /api/templates/:id/test-send` with the current sample data parsed as JSON (or `{}` if the sample data field is empty or invalid JSON)
- While the request is in flight the button MUST be disabled and show a loading indicator
- On success the system MUST show a success toast: `t("templateEditor.testSend.success")`
- On 429 (rate limit) the system MUST show an error toast: `t("templateEditor.testSend.rateLimitError")`
- On 502 or other failure the system MUST show an error toast: `t("templateEditor.testSend.deliveryError")`

## Additional i18n Keys

```json
"templateEditor": {
  "testSend": {
    "button": "Send Test",
    "sending": "Sending...",
    "success": "Test email sent to your inbox.",
    "rateLimitError": "Daily limit reached (100 test emails). Try again tomorrow.",
    "deliveryError": "Failed to deliver the test email. Check your email settings."
  }
}
```
