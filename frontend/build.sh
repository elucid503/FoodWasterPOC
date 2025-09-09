bun build ./scripts/index.ts --outdir ./out/scripts --watch --minify &
sass --watch styles/index.scss:out/styles/index.min.css --style=compressed --silence-deprecation=import
wait