export type HTTPMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PATCH' | 'PUT';

export async function callMicroservice<T = object>(
    method: HTTPMethod = 'GET',
    url: string,
    options?: { body?: object; headers?: Record<string, string> }
): Promise<T | Response> {
    const headers = options?.headers ?? {};

    const fetchOptions: { method: HTTPMethod; body?: string; headers: Record<string, string> } = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    };

    if (options?.body) fetchOptions.body = JSON.stringify(options.body);

    try {
        const response = await fetch(url, fetchOptions);

        if (!response.ok) throw new Error(response.statusText);

        if (response.headers.get('Content-Type') === 'application/json') {
            const data = await response.json();
            return data as T;
        }

        return response;
    } catch (error) {
        throw error;
    }
}

type MicroserviceRequest = {
    url: string;
    headers?: Record<string, string>;
};

type MicroserviceRequestWithBody = MicroserviceRequest & { body: object };

async function GET(options: MicroserviceRequest) {
    const { url, headers } = options;
    return callMicroservice('GET', url, { headers });
}

async function POST(options: MicroserviceRequestWithBody) {
    const { url, headers, body } = options;
    return callMicroservice('POST', url, { headers, body });
}

async function PATCH(options: MicroserviceRequestWithBody) {
    const { url, headers, body } = options;
    return callMicroservice('PATCH', url, { headers, body });
}

async function PUT(options: MicroserviceRequestWithBody) {
    const { url, headers, body } = options;
    return callMicroservice('PUT', url, { headers, body });
}

async function DELETE(options: MicroserviceRequestWithBody) {
    const { url, headers, body } = options;
    return callMicroservice('DELETE', url, { headers, body });
}

export const microservice = {
    GET,
    POST,
    PATCH,
    PUT,
    DELETE,
};
