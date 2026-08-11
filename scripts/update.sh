#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$HOME/tld-gamon"
ENV_FILE="$REPO_DIR/.env.production"
IMAGE="tld-gamon"
CONTAINER="gamon"

echo "==> [1/4] Pulling latest changes..."
git -C "$REPO_DIR" pull

echo "==> [2/4] Building Docker image..."
docker build -t "$IMAGE" "$REPO_DIR"

echo "==> [3/4] Replacing container..."
docker stop "$CONTAINER" 2>/dev/null || true
docker rm   "$CONTAINER" 2>/dev/null || true

docker run -d \
  --name "$CONTAINER" \
  --restart unless-stopped \
  --env-file "$ENV_FILE" \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  "$IMAGE"

echo "==> [4/4] Pruning dangling images..."
docker image prune -f

echo ""
echo "==> Deploy complete. Recent container logs:"
docker logs --tail 30 "$CONTAINER"
