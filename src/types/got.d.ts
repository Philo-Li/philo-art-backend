declare module 'got' {
  interface GotOptions {
    username?: string;
    password?: string;
    [key: string]: unknown;
  }

  interface GotResponse {
    body: string;
  }

  function got(url: string, options?: GotOptions): Promise<GotResponse>;

  export = got;
}
