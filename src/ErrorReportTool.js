export function reportError(e) {
    console.log(e);
}

export function reportRequestFailure(fetchParams, status, data, token) {
    let report = `Failed to fetch: ${fetchParams.method} ${fetchParams.url}`;
    report += `\nHeaders: ${JSON.stringify(fetchParams.headers)}`;
    report += `\nStatus code: ${status}`;

    if(data.error) report += `\nGoogle API errors: ${JSON.stringify(data.error)}`;
    report = report.replaceAll(token, "ACCESS_TOKEN");
    return reportError(report);
}
