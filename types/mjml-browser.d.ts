declare module "mjml-browser" {
  interface MjmlError {
    message: string;
    formattedMessage: string;
    line: number;
    tagName: string;
  }

  interface MjmlResult {
    html: string;
    errors: MjmlError[];
  }

  interface MjmlOptions {
    validationLevel?: "strict" | "soft" | "skip";
    minify?: boolean;
    beautify?: boolean;
  }

  function mjml(input: string, options?: MjmlOptions): MjmlResult;

  export default mjml;
}
