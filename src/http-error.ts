export class HTTPError extends Error {
  public response: Response;

  constructor(response: Response, url: URL) {
    const code =
      response.status || response.status === 0 ? response.status : "";
    const title = response.statusText || "";
    const status = `${code} ${title}`.trim();
    const reason = status ? `status code ${status}` : "an unknown error";

    super(`Request failed with ${reason}: ${url.toString()}`);
    this.name = "HTTPError";
    this.response = response;
  }
}
