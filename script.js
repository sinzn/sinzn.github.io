document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    
    let mousePosition = { x: 0, y: 0 };
    let isTouching = false;
    let isMobile = false;
    let animationFrameId;
    let particles = [];
    let textImageData = null;
    let backgroundDots = [];
    
    // Update canvas size and check if mobile
    function updateCanvasSize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      isMobile = window.innerWidth < 768;
    }
    
    updateCanvasSize();
    
    // Create text image data
    function createTextImage() {
      if (!ctx || !canvas) return 0;
      
      ctx.fillStyle = "#9ade00"; // AWS green color
      ctx.save();
      
      const fontSize = isMobile ? 60 : 100;
      ctx.font = `bold ${fontSize}px 'Arial', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Draw the text
      const text = "sinzn";
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      
      ctx.restore();
      
      textImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      return fontSize / 100; // Return scale factor
    }
    
    // Create a single particle
    function createParticle(scale) {
      if (!ctx || !canvas || !textImageData) return null;
      
      const data = textImageData.data;
      
      for (let attempt = 0; attempt < 100; attempt++) {
        const x = Math.floor(Math.random() * canvas.width);
        const y = Math.floor(Math.random() * canvas.height);
        
        if (data[(y * canvas.width + x) * 4 + 3] > 128) {
          return {
            x: x,
            y: y,
            baseX: x,
            baseY: y,
            size: Math.random() * 2 + 1,
            color: "#9ade00",
            scatteredColor: "#c4ff00",
            life: Math.random() * 100 + 50
          };
        }
      }
      
      return null;
    }
    
    // Create initial particles
    function createInitialParticles(scale) {
      const baseParticleCount = 7000;
      const particleCount = Math.floor(baseParticleCount * Math.sqrt((canvas.width * canvas.height) / (1920 * 1080)));
      
      for (let i = 0; i < particleCount; i++) {
        const particle = createParticle(scale);
        if (particle) particles.push(particle);
      }
    }
    
    // Create background dots pattern
    function createBackgroundDots() {
      if (!ctx || !canvas) return [];
      
      const dots = [];
      const spacing = isMobile ? 20 : 30;
      const size = isMobile ? 1 : 1.5;
      
      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          // Add some randomness to the grid
          const offsetX = Math.random() * 5 - 2.5;
          const offsetY = Math.random() * 5 - 2.5;
          
          dots.push({
            x: x + offsetX,
            y: y + offsetY,
            size: size
          });
        }
      }
      
      return dots;
    }
    
    // Animation function
    function animate(scale) {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw background dots
      ctx.fillStyle = "#9ade00";
      ctx.globalAlpha = 0.2;
      for (const dot of backgroundDots) {
        ctx.fillRect(dot.x, dot.y, dot.size, dot.size);
      }
      ctx.globalAlpha = 1.0;
      
      const { x: mouseX, y: mouseY } = mousePosition;
      const maxDistance = 240;
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance && (isTouching || !("ontouchstart" in window))) {
          const force = (maxDistance - distance) / maxDistance;
          const angle = Math.atan2(dy, dx);
          const moveX = Math.cos(angle) * force * 60;
          const moveY = Math.sin(angle) * force * 60;
          p.x = p.baseX - moveX;
          p.y = p.baseY - moveY;
          
          ctx.fillStyle = p.scatteredColor;
        } else {
          p.x += (p.baseX - p.x) * 0.1;
          p.y += (p.baseY - p.y) * 0.1;
          ctx.fillStyle = p.color;
        }
        
        ctx.fillRect(p.x, p.y, p.size, p.size);
        
        p.life--;
        if (p.life <= 0) {
          const newParticle = createParticle(scale);
          if (newParticle) {
            particles[i] = newParticle;
          } else {
            particles.splice(i, 1);
            i--;
          }
        }
      }
      
      const baseParticleCount = 7000;
      const targetParticleCount = Math.floor(
        baseParticleCount * Math.sqrt((canvas.width * canvas.height) / (1920 * 1080))
      );
      
      while (particles.length < targetParticleCount) {
        const newParticle = createParticle(scale);
        if (newParticle) particles.push(newParticle);
      }
      
      animationFrameId = requestAnimationFrame(() => animate(scale));
    }
    
    // Event handlers
    function handleResize() {
      updateCanvasSize();
      const newScale = createTextImage();
      particles = [];
      backgroundDots = createBackgroundDots();
      createInitialParticles(newScale);
    }
    
    function handleMove(x, y) {
      mousePosition = { x, y };
    }
    
    function handleMouseMove(e) {
      handleMove(e.clientX, e.clientY);
    }
    
    function handleTouchMove(e) {
      if (e.touches.length > 0) {
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }
    
    function handleTouchStart() {
      isTouching = true;
    }
    
    function handleTouchEnd() {
      isTouching = false;
      mousePosition = { x: 0, y: 0 };
    }
    
    function handleMouseLeave() {
      if (!("ontouchstart" in window)) {
        mousePosition = { x: 0, y: 0 };
      }
    }
    
    // Initialize
    const scale = createTextImage();
    backgroundDots = createBackgroundDots();
    createInitialParticles(scale);
    animate(scale);
    
    // Add event listeners
    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchend", handleTouchEnd);
  });
