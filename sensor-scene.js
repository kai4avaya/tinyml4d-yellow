// Relies on global THREE from CDN

window.initSensorScene = function(container) {
    // --- 1. Scene Setup ---
    const scene = new THREE.Scene();
    
    // Adjust camera for a section view
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 15, 20); 
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor( 0x000000, 0 ); 
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- 2. Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // --- 3. Construction ---

    const systemGroup = new THREE.Group();
    scene.add(systemGroup);
    
    const boardGroup = new THREE.Group();
    systemGroup.add(boardGroup);

    // -- Materials --
    function createCircuitTexture(colorBase, colorTrace) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = colorBase || '#002a18'; 
        ctx.fillRect(0, 0, 512, 512);

        ctx.strokeStyle = colorTrace || '#005530';
        ctx.lineWidth = 4;
        
        for(let i=0; i<40; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * 512, Math.random() * 512);
            let cx = Math.random() * 512;
            let cy = Math.random() * 512;
            ctx.lineTo(cx, cy);
            ctx.stroke();
        }
        return new THREE.CanvasTexture(canvas);
    }

    // NEW: Function to create matched color and emissive maps for the main board
    function createActiveCircuitTextures() {
        const canvasColor = document.createElement('canvas');
        const canvasEmissive = document.createElement('canvas');
        canvasColor.width = canvasEmissive.width = 512;
        canvasColor.height = 512;
        
        const ctxColor = canvasColor.getContext('2d');
        const ctxEmissive = canvasEmissive.getContext('2d');

        // 1. Backgrounds
        ctxColor.fillStyle = '#002a18'; // Dark green base
        ctxColor.fillRect(0, 0, 512, 512);
        
        ctxEmissive.fillStyle = '#000000'; // Black background (no glow)
        ctxEmissive.fillRect(0, 0, 512, 512);

        // 2. Traces Setup
        const setupStroke = (ctx, color) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 6; // Slightly thicker for visibility
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        };

        setupStroke(ctxColor, '#005530'); // Copper
        setupStroke(ctxEmissive, '#00ffaa'); // Glow

        // Helper to draw a Manhattan trace
        const drawTrace = (x1, y1, x2, y2, glow) => {
            const midX = x1 + (x2 - x1) * 0.5;
            const midY = y1 + (y2 - y1) * 0.5;

            // Define path function to reuse for both contexts
            const definePath = (ctx) => {
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                // Determine dominant direction for L-shape routing
                if (Math.abs(x2 - x1) > Math.abs(y2 - y1)) {
                        // Horizontal dominant
                        ctx.lineTo(midX, y1);
                        ctx.lineTo(midX, y2);
                        ctx.lineTo(x2, y2);
                } else {
                        // Vertical dominant
                        ctx.lineTo(x1, midY);
                        ctx.lineTo(x2, midY);
                        ctx.lineTo(x2, y2);
                }
            };

            // Draw Copper
            definePath(ctxColor);
            ctxColor.stroke();
            // Copper Pad
            ctxColor.fillStyle = '#ccaa00';
            ctxColor.beginPath(); ctxColor.arc(x2, y2, 5, 0, Math.PI*2); ctxColor.fill();

            // Draw Glow (if active)
            if (glow) {
                definePath(ctxEmissive);
                ctxEmissive.stroke();
                // Glow Pad
                ctxEmissive.fillStyle = '#00ffaa';
                ctxEmissive.beginPath(); ctxEmissive.arc(x2, y2, 5, 0, Math.PI*2); ctxEmissive.fill();
            }
        };

        // Generate Ordered "Data Buses"
        const centerX = 256;
        const centerY = 256;
        const chipOffset = 60; // Start lines this far from center

        // Define 4 Banks of traces
        const banks = [
            { dx: 0, dy: -1, count: 12, spread: 15 }, // Up
            { dx: 0, dy: 1, count: 12, spread: 15 },  // Down
            { dx: -1, dy: 0, count: 8, spread: 20 },  // Left
            { dx: 1, dy: 0, count: 8, spread: 20 }    // Right
        ];

        banks.forEach((bank) => {
            for(let i=0; i<bank.count; i++) {
                // Center the bank relative to the chip
                const offset = (i - (bank.count - 1) / 2) * bank.spread;
                
                // Start point (on chip edge)
                let startX = centerX + (bank.dx * chipOffset) + (bank.dx === 0 ? offset : 0);
                let startY = centerY + (bank.dy * chipOffset) + (bank.dy === 0 ? offset : 0);
                
                // End point (towards board edge)
                let endX = startX + (bank.dx * 180);
                let endY = startY + (bank.dy * 180);
                
                // Fan out slightly at the ends
                if (bank.dx === 0) endX += offset * 0.5;
                else endY += offset * 0.5;

                // Logic for Ordered Glow:
                // Only light up the middle 2-3 traces of the bus
                const distanceToCenter = Math.abs(i - (bank.count - 1) / 2);
                const isCenterTrace = distanceToCenter < 1.5; 
                
                drawTrace(startX, startY, endX, endY, isCenterTrace);
            }
        });
        
        return {
            map: new THREE.CanvasTexture(canvasColor),
            emissiveMap: new THREE.CanvasTexture(canvasEmissive)
        };
    }

    const mainBoardTextures = createActiveCircuitTextures();

    const pcbMaterial = new THREE.MeshStandardMaterial({
        color: 0x004422, 
        roughness: 0.9, 
        metalness: 0.1,
        map: mainBoardTextures.map,
        emissiveMap: mainBoardTextures.emissiveMap,
        emissive: 0xffffff, // White tint on the colored emissive map
        emissiveIntensity: 0 // Start dark
    });

    const blackPlasticMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const metalSilverMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.6, metalness: 0.6 });
    const metalGoldMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.6, metalness: 0.6 });
    
    // Wire materials
    const wireMats = [
        new THREE.MeshStandardMaterial({ color: 0xff3333, roughness: 0.7 }), // Red
        new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 }), // Black
        new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.7 }), // Yellow
        new THREE.MeshStandardMaterial({ color: 0x3366ff, roughness: 0.7 }), // Blue
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }), // White
    ];

    // -- Main MCU Board --
    const boardWidth = 4;
    const boardLength = 6.5;
    const boardHeight = 0.1;
    
    const pcb = new THREE.Mesh(new THREE.BoxGeometry(boardWidth, boardHeight, boardLength), pcbMaterial);
    pcb.castShadow = true; pcb.receiveShadow = true;
    boardGroup.add(pcb);

    // Reset chip material to generic black plastic (no flashing)
    const chip = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.15, 1.5), blackPlasticMat);
    chip.position.y = boardHeight/2 + 0.075;
    chip.rotation.y = Math.PI / 4;
    chip.castShadow = true;
    boardGroup.add(chip);

    const usb = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 1), metalSilverMat);
    usb.position.set(0, 0.25, -boardLength/2 + 0.5);
    boardGroup.add(usb);

    // Header Pins
    const headerGeo = new THREE.BoxGeometry(0.5, 0.4, boardLength - 1);
    [-1, 1].forEach(side => {
        const header = new THREE.Mesh(headerGeo, blackPlasticMat);
        header.position.set(side * (boardWidth/2 - 0.4), 0.2, 0);
        header.castShadow = true;
        boardGroup.add(header);
        
        // Add visible gold pins on top
        for(let i=0; i<12; i++) {
            const pin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.1), metalGoldMat);
            pin.position.set(side * (boardWidth/2 - 0.4), 0.5, (i-5.5)*0.4);
            boardGroup.add(pin);
        }
    });

    // --- 4. Sensors & Wires ---

    const animatedWires = []; // Stores { mesh, connectionOrder }

    function createSensor(index, total, type) {
        const angle = (index / total) * Math.PI * 2;
        const radius = 7 + Math.random() * 2; // Vary distance slightly
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const sensorGroup = new THREE.Group();
        sensorGroup.position.set(x, (Math.random()-0.5)*2, z); // Vary height
        sensorGroup.lookAt(0, 0, 0); // Face center
        systemGroup.add(sensorGroup);

        // Sensor PCB
        const sPcbMat = new THREE.MeshStandardMaterial({
            color: 0x003300, roughness: 0.8,
            map: createCircuitTexture('#002200', '#004400')
        });
        const sPcb = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 1.5), sPcbMat);
        sPcb.castShadow = true;
        sensorGroup.add(sPcb);

        // Sensor Component Visuals
        let component;
        if (type === 'motion') {
            component = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16, 0, Math.PI*2, 0, Math.PI/2), new THREE.MeshStandardMaterial({color: 0xffffff, transparent:true, opacity:0.8}));
        } else if (type === 'temp') {
            component = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.5), new THREE.MeshStandardMaterial({color: 0x3366cc}));
        } else if (type === 'light') {
            component = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 12), new THREE.MeshStandardMaterial({color: 0xffaa00}));
            component.rotation.x = Math.PI/2;
        } else {
            component = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.6), new THREE.MeshStandardMaterial({color: 0x888888}));
        }
        component.position.y = 0.1;
        sensorGroup.add(component);

        // Create Wires
        const numWires = 2 + Math.floor(Math.random() * 2); 
        
        for(let w=0; w<numWires; w++) {
            const side = x > 0 ? 1 : -1;
            const pinIdx = Math.floor(Math.random() * 12);
            
            const startLocal = new THREE.Vector3(
                side * (boardWidth/2 - 0.4), 
                0.5, 
                (pinIdx - 5.5) * 0.4
            );
            
            const endLocal = new THREE.Vector3((w - (numWires-1)/2)*0.3, 0.1, 0.5).applyMatrix4(sensorGroup.matrix);

            const p0 = startLocal;
            const p3 = endLocal;
            const p1 = p0.clone().add(new THREE.Vector3(side*2, 3 + Math.random(), 0));
            const p2 = p3.clone().add(new THREE.Vector3(0, 2 + Math.random(), 0));

            const curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
            const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.04, 8, false);
            
            tubeGeo.setDrawRange(0, 0);
            
            const wireMesh = new THREE.Mesh(tubeGeo, wireMats[w % wireMats.length]);
            systemGroup.add(wireMesh);

            animatedWires.push({
                mesh: wireMesh,
                sensorIndex: index,
                speedOffset: Math.random() * 0.2 
            });
        }
    }

    const sensorTypes = ['motion', 'temp', 'light', 'generic', 'generic', 'generic'];
    sensorTypes.forEach((type, i) => createSensor(i, 6, type));

    // --- 5. Infinite Scroll Logic ---

    let targetScroll = 0;
    let currentScroll = 0;
    
    // We bind events to window but gate them by checking if we are near bottom
    const handleWheel = (e) => {
        // Check if we are near the bottom of the page
        const scrollBottom = window.scrollY + window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        
        // Allow activation if we are within 200px of bottom
        if (scrollBottom >= docHeight - 200) {
           targetScroll += e.deltaY * 0.5;
           if(targetScroll < 0) targetScroll = 0;
        }
    };

    let touchStart = 0;
    const handleTouchStart = (e) => { touchStart = e.touches[0].clientY; };
    const handleTouchMove = (e) => {
        const scrollBottom = window.scrollY + window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        
        if (scrollBottom >= docHeight - 200) {
             const delta = touchStart - e.touches[0].clientY;
             targetScroll += delta * 2;
             touchStart = e.touches[0].clientY;
             if(targetScroll < 0) targetScroll = 0;
        }
    };

    window.addEventListener('wheel', handleWheel);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);

    let animationId;
    function animate() {
        animationId = requestAnimationFrame(animate);

        currentScroll += (targetScroll - currentScroll) * 0.08;

        const rotationProgress = currentScroll * 0.002;
        
        systemGroup.rotation.y = Math.sin(rotationProgress) * 0.5 + rotationProgress; 
        systemGroup.rotation.x = Math.sin(rotationProgress * 0.5) * 0.5;
        systemGroup.rotation.z = Math.cos(rotationProgress * 0.3) * 0.2;

        const connectionSpacing = 800;
        
        animatedWires.forEach(wireData => {
            const { mesh, sensorIndex, speedOffset } = wireData;
            const startThreshold = sensorIndex * connectionSpacing;
            let progress = (currentScroll - startThreshold) / (connectionSpacing * 0.8);
            progress += speedOffset;
            progress = Math.max(0, Math.min(1, progress));
            
            if (!mesh.userData.maxDrawRange) mesh.userData.maxDrawRange = 64 * 8 * 6;
            mesh.geometry.setDrawRange(0, Math.floor(mesh.userData.maxDrawRange * progress));
        });

        const glowStart = 3500;
        const glowFull = 5500;
        
        let glowIntensity = Math.min(Math.max((currentScroll - glowStart) / (glowFull - glowStart), 0), 2.0);
        pcbMaterial.emissiveIntensity = glowIntensity;
        
        if(glowIntensity > 0.1) {
             pcbMaterial.emissiveIntensity += Math.sin(Date.now() * 0.005) * 0.3;
        }

        renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
        window.removeEventListener('wheel', handleWheel);
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
        renderer.dispose();
        // Dispose of scene items if necessary, though basic cleanup is usually sufficient for simple reloads
    };
}
