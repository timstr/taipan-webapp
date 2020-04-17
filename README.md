# taipan-webapp

# What it is

A webapp for playing [Tai Pan (A.K.A Tichu)](https://en.wikipedia.org/wiki/Tichu) with your friends.

See it in action here (if you know the password): https://timstaipanserver.ca

The rules of the game are largely neither explained nor enforced. It is assumed that all players can
hear eachother speaking while they play, to keep the gameplay more natural and social.

## How to build it

Requires [yarn](https://yarnpkg.com/). After cloning, run `yarn` in the project root to fetch the
dependencies. Then to build, run `yarn build` from the project root. You can optionally set the
`NODE_ENV` environment variable to either `development` or `production` to build in debug or release
mode, respectively, before running the build command.

To deploy, simply copy everything in the `dist/` directory to where you want to host the server
from. To run the server, you'll then need to set a few environment variables:

- `PUBLIC_ROOT` : the path to the folder whose where files are served by the HTTPS server.
  This is intended for the files placed into the `dist/public/` folder during build.
  Typically you'll want be this value to be `./public`
- `SECRET_KEY_PATH` : the path to the key file for the HTTPS server. You can generate this
  using OpenSSL (self-signed, but browsers will hate you), or, if you have a domain name,
  you can easily get certification from [Let's Encrpyt](https://letsencrypt.org/) and
  get a key in the process.
- `SECRET_CERT_PATH` : the path to the certificate file for the HTTPS server. See
  `SECRET_KEY_PATH` above for details; you'll generate this similarly.
- `GAME_PASSWORD_PATH` (optional) : the path to a plaintext file containing the SHA256 digest
  of the password required to join the game. If this is not set, no password will be required
  to play, and users can enter anything into the password field to gain entry to the game.
  You can create this file easily by running `node hashpassword.js` which is found in the
  `dist/util` path after building.
  
The files these environment variables point to (with the exception of `PUBLIC_ROOT`) should all
be considered secret and carefully guarded. If HTTPS proves to be too complicated, you can
simply modify the source code to use a single HTTP server instead.

Finally, once the environment variables above are set, run `node main.js`, where `main.js` is taken
from `dist/server/` after building. This will run an https server and websocket server
on port 403 (the default for HTTPS), as well as an HTTP->HTTPS redirect server on port 80 (the
default for HTTP). The redirect server simply upgrades traffic to use the secure protocol, and
allows you to share links to the webapp more easily without worrying about the `https://` bit,
since `http://` is typically assumed.

## What it's made of

Both the frontend and backend are built using [TypeScript](https://www.typescriptlang.org/). The
frontend uses [React](https://reactjs.org/) for the html UI. Two-way communication is done using
[WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) using a custom
JSON-based message system. The game state is stored and maintained using a pattern similar to
[Redux](https://redux.js.org/), in that the game state is stored in a single variable, which
is replaced (not modified) by a function taking the old state and an action which describes
the desired changed. Indeed, most of this webapp is written in a very functional style. The build
system uses [WebPack](https://webpack.js.org/) with a few plugins to easily and reliably build
and bundle everything.
