# Sample `.dot` files

```bash

declare -a DOT_FILE_URLS=(
    "https://graphviz.org/Gallery/directed/cluster.gv.txt"
    "https://graphviz.org/Gallery/directed/colors.gv.txt"
    "https://graphviz.org/Gallery/directed/crazy.gv.txt"
    "https://graphviz.org/Gallery/directed/datastruct.gv.txt"
    "https://graphviz.org/Gallery/directed/fsm.gv.txt"
    "https://graphviz.org/Gallery/directed/Genetic_Programming.gv.txt"
    "https://graphviz.org/Gallery/directed/go-package.gv.txt"
    "https://graphviz.org/Gallery/directed/hello.gv.txt"
    "https://graphviz.org/Gallery/directed/kennedyanc.gv.txt"
    "https://graphviz.org/Gallery/directed/Linux_kernel_diagram.gv.txt"
    "https://graphviz.org/Gallery/directed/neural-network.gv.txt"
    "https://graphviz.org/Gallery/directed/ninja.gv.txt"
    "https://graphviz.org/Gallery/directed/pprof.gv.txt"
    "https://graphviz.org/Gallery/directed/psg.gv.txt"
    "https://graphviz.org/Gallery/directed/UML_Class_diagram.gv.txt"
    "https://graphviz.org/Gallery/directed/unix.gv.txt"
    "https://graphviz.org/Gallery/directed/world.gv.txt"
    "https://graphviz.org/Gallery/gradient/angles.gv.txt"
    "https://graphviz.org/Gallery/gradient/cluster.gv.txt"
    "https://graphviz.org/Gallery/gradient/datastruct.gv.txt"
    "https://graphviz.org/Gallery/gradient/g_c_n.gv.txt"
    "https://graphviz.org/Gallery/gradient/linear_angle.gv.txt"
    "https://graphviz.org/Gallery/twopi/twopi2.gv.txt"
    "https://graphviz.org/Gallery/undirected/color_wheel.gv.txt"
    "https://graphviz.org/Gallery/undirected/ER.gv.txt"
    "https://graphviz.org/Gallery/undirected/gd_1994_2007.gv.txt"
    "https://graphviz.org/Gallery/undirected/grid.gv.txt"
    "https://graphviz.org/Gallery/undirected/happiness.gv.txt"
    "https://graphviz.org/Gallery/undirected/networkmap_twopi.gv.txt"
    "https://graphviz.org/Gallery/undirected/philo.gv.txt"
    "https://graphviz.org/Gallery/undirected/softmaint.gv.txt"
    "https://graphviz.org/Gallery/undirected/transparency.gv.txt"
)


for url in "${DOT_FILE_URLS[@]}"; do
    echo ""
    echo "-------------------------"
    echo "$url"
    file_1="${url##*/}"
    echo "$file_1"
    file_2="${file_1%.txt}.dot"
    echo "$file_2"
    wget -O $file_2 $url
done

```
