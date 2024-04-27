# mw-deploy-bot

```bash
node dist/index.js <target_dir> <release_tag_name>
```

## use with docker cli
```
docker run --rm -v <local_release_cache>:/releases -v <local_target_dir>:<target_dir>  mw-deploy-bot /<target_dir> <release_tag_name>
```