
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

export const AtomFieldAnimation = () => {
    const [atoms, setAtoms] = useState<any[]>([]);
    const isMobile = useIsMobile();

    useEffect(() => {
        const numAtoms = isMobile ? 35 : 70;
        const newAtoms = Array.from({ length: numAtoms }).map((_, i) => {
            const electrons = Array.from({ length: Math.floor(Math.random() * 3) + 2 }).map((__, j) => ({
                id: j,
                orbitRx: (Math.random() * 0.8 + 0.6) * (isMobile ? 40 : 60),
                orbitRy: (Math.random() * 0.8 + 0.6) * (isMobile ? 40 : 60),
                duration: Math.random() * 5 + 8,
                initialAngle: Math.random() * 360,
            }));
            return {
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                electrons: electrons,
                groupRotation: Math.random() * 180,
            };
        });
        setAtoms(newAtoms);
    }, [isMobile]);

    if (atoms.length === 0) return null;

    return (
        <div className="absolute inset-0 z-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,white_15%,transparent_70%)]">
            <svg width="100%" height="100%" className="overflow-visible">
                {atoms.map(atom => (
                    <g key={atom.id} style={{ transform: `translate(${atom.x}vw, ${atom.y}vh)` }}>
                        <g style={{ transform: `rotate(${atom.groupRotation}deg)`}}>
                             {/* Nucleus */}
                            <motion.circle 
                                cx="0" cy="0" r="4" fill="hsl(var(--primary))"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            />
                            {/* Electrons */}
                            {atom.electrons.map(e => (
                                <g key={e.id}>
                                    <motion.g 
                                        animate={{ rotate: [e.initialAngle, e.initialAngle + 360] }}
                                        transition={{ duration: e.duration, repeat: Infinity, ease: "linear" }}
                                    >
                                        <ellipse cx={0} cy={0} rx={e.orbitRx} ry={e.orbitRy} stroke="hsl(var(--primary)/0.5)" strokeWidth={1} fill="none" />
                                        <circle cx={e.orbitRx} cy={0} r={2.5} fill="hsl(var(--accent))" />
                                    </motion.g>
                                </g>
                            ))}
                        </g>
                    </g>
                ))}
            </svg>
        </div>
    );
};
