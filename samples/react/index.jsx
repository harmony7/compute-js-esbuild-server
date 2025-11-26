import * as React from 'https://unpkg.com/react?conditions=edge-light';
import * as Server from 'https://unpkg.com/react-dom/server?conditions=edge-light';

export default async function () {

    const Greet = () => <h1>Hello, world!</h1>;
    return new Response(
        await Server.renderToReadableStream(<Greet />),
        {
            status: 200,
            headers: {
                'Content-Type': 'text/html'
            },
        },
    );
}
