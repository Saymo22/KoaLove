import fs from 'node:fs/promises';
import path from 'node:path';

// Explicit allowlist: public/index.php must never be published as a static source file.
export async function publishStaticAssets(source='public',destination='dist'){
    await fs.mkdir(destination,{recursive:true});
    // Incremental builds must also remove a manifest published by an older build.
    await fs.rm(path.join(destination,'build/manifest.json'),{force:true});
    for(const directory of ['build/assets','media','branding']){
        await fs.cp(path.join(source,directory),path.join(destination,directory),{recursive:true});
    }
    await fs.copyFile(path.join(source,'favicon.svg'),path.join(destination,'favicon.svg'));
}
