export function buildQueryURL(url, params) {
  if(params) {
    url += "?";
    for(const key in params)
      url += key + "=" + encodeURIComponent(params[key]) + "&";
    url = url.substring(0, url.length - 1);
  }
  return url;
}
