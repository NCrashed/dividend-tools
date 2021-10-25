How to
======

1. You should install [zola](https://www.getzola.org/) tool:

    - via [nix](https://nixos.org/) simply run `nix-shell` in the repo root folder.
    
    - or [other](https://www.getzola.org/documentation/getting-started/installation/) way. 

2. To run local development server run `cd dividend-tools && zola serve` 
3. To prepare files for deployment run `cd dividend-tools && ./publish.sh`
4. After pushing changes produced by the `publish.sh` script, your changes will be visible on https://ncrashed.github.io/dividend-tools in several minutes.
