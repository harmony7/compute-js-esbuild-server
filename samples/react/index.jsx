import * as React from 'react';
import * as Server from 'react-dom/server.edge';

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
