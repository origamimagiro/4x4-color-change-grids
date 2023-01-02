const SVG = {
    NS: "http://www.w3.org/2000/svg",
    append: (parent, size) => {
        const svg = document.createElementNS(SVG.NS, "svg"); 
        svg.style.width  = "100";
        svg.style.height = "100";
        svg.style.margin = "10";
        svg.style.background = "white";
        svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
        parent.appendChild(svg);
        return svg;
    },
    polygon: (parent, points) => {
        const poly = document.createElementNS(SVG.NS, "polygon"); 
        poly.style.fill  = "black";
        poly.setAttribute("points", points.map(v => v.join(",")).join(" "));
        parent.appendChild(poly);
        return poly;
    },
};

const GRID = {
    chars: "ABCDEF",
    inv_map: {"A": "B", "B": "A", "C": "E", "D": "F", "E": "C", "F": "D"},
    ref_map: {"A": "A", "B": "B", "C": "C", "D": "F", "E": "E", "F": "D"},
    rot_map: {"A": "A", "B": "B", "C": "D", "D": "C", "F": "E", "E": "F"},
    check_boards: (D, B, R) => {
        const I = B.map(c => GRID.inv_map[c]);
        const RI = R.map(c => GRID.inv_map[c]);
        let seen = false;
        const Bstr = B.join("");
        for (const BB of [R, I, RI]) {
            const str = BB.join("");
            if (D.has(str)) {
                D.get(str).push(Bstr);
                seen = true;
                break;
            }
        }
        if (!seen) {
            D.set(Bstr, [Bstr]);
        }
    },
    append_boards: (par, size, A, P) => {
        const h = size / 2;
        for (const B of A) {
            const svg = SVG.append(par, size);
            for (let j = 0; j < 4; ++j) {
                const g = document.createElementNS(SVG.NS, "g"); 
                g.setAttribute("transform", `rotate(${90*j} ${h} ${h})`);
                for (let i = 0; i < B.length; ++i) {
                    const c = B[i];
                    const [x, y] = P[i];
                    const [p1, p2, p3, p4] = [
                        [x, y], 
                        [x, y + 1], 
                        [x + 1, y + 1], 
                        [x + 1, y]
                    ];
                    svg.appendChild(g);
                    switch (c) { 
                        case "A": break;
                        case "B": SVG.polygon(g, [p1, p2, p3, p4]); break;
                        case "C": SVG.polygon(g, [p1, p2, p4]); break;
                        case "D": SVG.polygon(g, [p1, p3, p4]); break;
                        case "E": SVG.polygon(g, [p2, p3, p4]); break;
                        case "F": SVG.polygon(g, [p1, p2, p3]); break;
                    }
                }
            }
        }
    },
    append_all: (n, D, P) => {
        const main = document.getElementById(`main${n}`);
        let idx = 1;
        let first = 0;
        for (const A of D) {
            const name = document.createElement("div");
            main.appendChild(name);
            while (A[0][0] != GRID.chars[first]) {
                ++first;
                idx = 1;
            }
            name.innerHTML = `${GRID.chars[first]}${idx}: ${A.join(", ")}`;
            const div = document.createElement("div");
            main.appendChild(div);
            GRID.append_boards(div, n, A, P);
            ++idx;
        }
    },
};

window.onload = () => {
    const D1 = [["A", "B"]];
    const D2 = [["A", "B"], ["C", "E"], ["D", "F"]];
    const D3 = new Map();
    for (const c1 of GRID.chars) {
        for (const c2 of GRID.chars) {
            for (const c3 of "AB") {
                const B = [c1, c2, c3];
                const R = B.map(c => c);
                R[0] = GRID.ref_map[R[0]];
                R[1] = GRID.rot_map[R[1]];
                GRID.check_boards(D3, B, R);
            }
        }
    }
    const D4 = new Map();
    for (const c1 of GRID.chars) {
        for (const c2 of GRID.chars) {
            for (const c3 of GRID.chars) {
                for (const c4 of GRID.chars) {
                    const B = [c1, c2, c3, c4];
                    const R = B.map(c => GRID.ref_map[c]);
                    [R[1], R[2]] = [R[2], R[1]];
                    GRID.check_boards(D4, B, R);
                }
            }
        }
    }

    GRID.append_all(1, D1, [[0,0]]);
    GRID.append_all(2, D2, [[0,0]]);
    GRID.append_all(3, D3.values(), [[0,0], [1,0], [1,1]]);
    GRID.append_all(4, D4.values(), [[0,0], [1,0], [0,1], [1,1]]);
};
