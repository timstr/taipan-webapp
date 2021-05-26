# taipan-webapp

# What it is

A webapp for playing [Tai Pan (A.K.A Tichu)](https://en.wikipedia.org/wiki/Tichu) with your friends.

See it in action here (if you know the password): https://timstaipanserver.ca

The rules of the game are largely neither explained nor enforced. It is assumed that all players can
hear eachother speaking while they play, to keep the gameplay more natural and social.

## How to build it

Requires [yarn](https://yarnpkg.com/). After cloning, run `$ yarn` in the project root to fetch the
dependencies. Then to build, run `$ yarn build` from the project root. You can optionally set the
`NODE_ENV` environment variable to either `development` or `production` to build in debug or release
mode, respectively, before running the build command.

To deploy, simply copy everything in the `dist/` directory to where you want to host the server
from. To run the server, you'll then need to set a few environment variables:

- `PUBLIC_ROOT` : the path to the folder whose where files are served by the HTTPS server.
  This is intended for the files placed into the `dist/public/` folder during build.
- `SECRET_KEY_PATH` (not required if `--insecure` option is used) : the path to the key file for the HTTPS server. You can generate this
  using OpenSSL (self-signed, but browsers will hate you), or, if you have a domain name,
  you can easily get certification from [Let's Encrpyt](https://letsencrypt.org/) and
  get a key in the process.
- `SECRET_CERT_PATH` (not required if `--insecure` option is used) : the path to the certificate file for the HTTPS server. See
  `SECRET_KEY_PATH` above for details; you'll generate this similarly.
- `GAME_PASSWORD_PATH` (optional) : the path to a plaintext file containing the SHA256 digest
  of the password required to join the game. If this is not set, no password will be required
  to play, and users can enter anything into the password field to gain entry to the game.
  You can create this file and choose a new password easily by running `$ node hashpassword.js`
  which is found in the `dist/util` path after building.
  
The files that these environment variables point to (with the exception of `PUBLIC_ROOT`) should all
be considered secret and carefully guarded. If HTTPS proves to be too complicated (e.g. during development), you can
simply run the app with the `--insecure` option to use HTTP only.

Finally, once the environment variables above are set, run `$ node main.js` (or `$ node main.js --insecure` to use http instead of https, which is simpler for development but less safe), where `main.js` is taken
from `dist/server/` after building. This will run an http server that can be visited at `http://localhost` if running on your local machine, or `http://yourdomainname.com` if running on a machine pointed to by a domain name that you own.

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
