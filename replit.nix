{ pkgs }: {
  deps = [
    pkgs.python311Full
    pkgs.python311Packages.pip
    pkgs.nodejs_20
    pkgs.cmake
    pkgs.gcc
    pkgs.gnumake
    pkgs.openblas
    pkgs.git
    pkgs.pkg-config
  ];
}
