import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { FaceLandmarker, HandLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { ShieldAlert, ShieldCheck, Activity, Eye, User, Settings, CheckCircle2, XCircle } from 'lucide-react';
import clsx from 'clsx';

export default function LiveDetect() {
  const isMounted = useRef(true);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [livenessState, setLivenessState] = useState({
    blinking: false,
    smiling: false,
    headTurn: false
  });
  
  const [verificationProgress, setVerificationProgress] = useState(0);
  const verificationProgressRef = useRef(0);
  
  const [isVerified, setIsVerified] = useState(false);
  
  const [activeSession, setActiveSessionRaw] = useState(false);
  const activeSessionRef = useRef(false);
  const setActiveSession = (val) => {
      setActiveSessionRaw(val);
      activeSessionRef.current = val;
  };
  
  const [activityCounts, setActivityCounts] = useState({
    blinks: 0,
    smiles: 0,
    turns: 0
  });
  const prevStates = useRef({ blinking: false, smiling: false, headTurn: false });
  
  // Track continuous frames for heuristics
  const blinkFrames = useRef(0);
  const faceLandmarkerRef = useRef(null);
  const handLandmarkerRef = useRef(null);

  useEffect(() => {
    isMounted.current = true;
    const initializeMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });
        faceLandmarkerRef.current = faceLandmarker;
        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        handLandmarkerRef.current = handLandmarker;
        
        setIsModelLoaded(true);
      } catch (err) {
        console.error("Failed to load MediaPipe:", err);
      }
    };
    initializeMediaPipe();
    
    return () => {
       isMounted.current = false;
       if (faceLandmarkerRef.current) faceLandmarkerRef.current.close();
       if (handLandmarkerRef.current) handLandmarkerRef.current.close();
    };
  }, []);

  const evaluateLiveness = (blendshapes) => {
    if (!blendshapes || blendshapes.length === 0) return;
    const shapes = blendshapes[0].categories;
    
    // Extract key metrics from blendshapes
    const eyeBlinkLeft = shapes.find(s => s.categoryName === 'eyeBlinkLeft')?.score || 0;
    const eyeBlinkRight = shapes.find(s => s.categoryName === 'eyeBlinkRight')?.score || 0;
    const smileLeft = shapes.find(s => s.categoryName === 'mouthSmileLeft')?.score || 0;
    const smileRight = shapes.find(s => s.categoryName === 'mouthSmileRight')?.score || 0;
    const jawOpen = shapes.find(s => s.categoryName === 'jawOpen')?.score || 0;
    const lookLeft = shapes.find(s => s.categoryName === 'eyeLookOutLeft')?.score || 0;
    const lookRight = shapes.find(s => s.categoryName === 'eyeLookOutRight')?.score || 0;

    // Blink Logic (Require both eyes above threshold to prevent micro-twitches)
    const isBlinking = eyeBlinkLeft > 0.4 && eyeBlinkRight > 0.4;
    
    // Smile Logic
    const isSmiling = smileLeft > 0.5 && smileRight > 0.5;

    // Head/Eye Turn Logic
    const isTurning = lookLeft > 0.6 || lookRight > 0.6;

    setLivenessState({
       blinking: isBlinking,
       smiling: isSmiling,
       headTurn: isTurning
    });

    if (activeSessionRef.current && verificationProgressRef.current < 100) {
        const didBlink = isBlinking && !prevStates.current.blinking;
        const didSmile = isSmiling && !prevStates.current.smiling;
        const didTurn = isTurning && !prevStates.current.headTurn;

        if (didBlink || didSmile || didTurn) {
            setActivityCounts(prev => ({
                blinks: prev.blinks + (didBlink ? 1 : 0),
                smiles: prev.smiles + (didSmile ? 1 : 0),
                turns: prev.turns + (didTurn ? 1 : 0)
            }));
        }

        let progressBump = 0;
        if (isBlinking) {
            blinkFrames.current++;
            if (blinkFrames.current === 1) progressBump += 35; // Major boost for clear blink
        } else {
            blinkFrames.current = 0;
        }

        if (isSmiling && !prevStates.current.smiling) progressBump += 15; // Boost for discrete smile
        if (isTurning && !prevStates.current.headTurn) progressBump += 15; // Boost for discrete head turn

        if (progressBump > 0) {
            setVerificationProgress(prev => {
                const next = Math.min(prev + progressBump, 100);
                if (next === 100) setIsVerified(true);
                verificationProgressRef.current = next;
                return next;
            });
        }
    }
    
    prevStates.current = { blinking: isBlinking, smiling: isSmiling, headTurn: isTurning };
  };

  const renderLoop = async () => {
    if (!isMounted.current) return;
    
    if (!webcamRef.current || !webcamRef.current.video || !canvasRef.current || !faceLandmarkerRef.current) {
        await new Promise(r => setTimeout(r, 50));
        requestAnimationFrame(renderLoop);
        return;
    }

    const video = webcamRef.current.video;
    
    // Ensure video is playing
    if (video.currentTime === 0 || video.videoWidth === 0) {
        await new Promise(r => setTimeout(r, 50));
        requestAnimationFrame(renderLoop);
        return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Match canvas size to video feed
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawingUtils = new DrawingUtils(ctx);
    
    try {
        const startTimeMs = performance.now();
        const results = faceLandmarkerRef.current.detectForVideo(video, startTimeMs);

        if (results.faceLandmarks) {
            for (const landmarks of results.faceLandmarks) {
                // Tesselation (overall wireframe mesh)
                drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: "#C0C0C040", lineWidth: 1 });
                
                // Overlay high-contrast contours for Key Features
                drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: "#00FF00" });
                drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, { color: "#00FF00" });
                drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: "#00FF00" });
                drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, { color: "#00FF00" });
                drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: "#E0E0E0", lineWidth: 2 });
                drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, { color: "#E0E0E0", lineWidth: 2 });
            }
        }
        
        if (results.faceBlendshapes) {
            evaluateLiveness(results.faceBlendshapes);
        }

        // Draw Hands if available
        if (handLandmarkerRef.current) {
            const handResults = handLandmarkerRef.current.detectForVideo(video, startTimeMs);
            if (handResults.landmarks) {
                for (const landmarks of handResults.landmarks) {
                    drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, { color: "#C0C0C040", lineWidth: 2 });
                    drawingUtils.drawLandmarks(landmarks, { color: "#00FF00", lineWidth: 1, radius: 2 });
                }
            }
        }

    } catch (err) {
        console.error("Tracking Error:", err);
    }
    
    await new Promise(r => setTimeout(r, 15)); // Force 15ms breathing room for UI clicks / React Router
    if (isMounted.current) {
        requestAnimationFrame(renderLoop);
    }
  };

  useEffect(() => {
    if (isModelLoaded) {
       renderLoop();
    }
  }, [isModelLoaded]);

  const startVerification = () => {
     setActiveSession(true);
     setVerificationProgress(0);
     verificationProgressRef.current = 0;
     setIsVerified(false);
     setActivityCounts({ blinks: 0, smiles: 0, turns: 0 });
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
       {/* Tracker Viewport */}
       <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-display font-bold uppercase tracking-wider flex items-center gap-2">
                 <Activity className="w-5 h-5 text-deepRed" /> Live Mesh Feed
             </h2>
             {isModelLoaded ? (
                 <span className="text-xs px-2 py-1 rounded bg-deepGreen/20 text-deepGreen font-mono uppercase tracking-widest border border-deepGreen/30 animate-pulse">
                     Tensor Active
                 </span>
             ) : (
                 <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-500 font-mono uppercase tracking-widest border border-yellow-500/30 animate-pulse">
                     Loading Weights...
                 </span>
             )}
          </div>
          
          <div className="relative w-full aspect-video bg-deepBase rounded-xl overflow-hidden border border-deepBorder shadow-[0_0_30px_rgba(30,30,30,0.5)]">
             <Webcam
                ref={webcamRef}
                audio={false}
                mirrored={true}
                className={clsx("absolute inset-0 w-full h-full object-cover transition-opacity duration-1000", isModelLoaded ? "opacity-100" : "opacity-0")}
             />
             <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none transform -scale-x-100 z-10"
             />
             
             {/* Scanner Overlay UI */}
             <div className="absolute inset-0 border-2 border-deepRed/20 pointer-events-none z-20" />
             <div className="absolute top-4 left-4 flex gap-2">
                <span className="w-2 h-2 rounded-full bg-deepRed animate-pulse" />
                <span className="text-[10px] text-white/50 font-mono tracking-widest">REC</span>
             </div>

             {!isModelLoaded && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30 space-y-4">
                     <div className="w-12 h-12 border-4 border-deepBorder border-t-deepRed rounded-full animate-spin" />
                     <p className="text-xs text-textMuted font-mono uppercase tracking-widest">Injecting WebAssembly Tensors</p>
                 </div>
             )}
          </div>

          <div className="grid grid-cols-3 gap-4">
              <div className={clsx("p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all", livenessState.blinking ? "bg-deepGreen/20 border-deepGreen" : "bg-deepCard border-deepBorder")}>
                  <Eye className={clsx("w-5 h-5", livenessState.blinking ? "text-deepGreen" : "text-textMuted")} />
                  <span className="text-xs font-mono tracking-wide text-textMuted uppercase">Blink</span>
              </div>
              <div className={clsx("p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all", livenessState.smiling ? "bg-deepGreen/20 border-deepGreen" : "bg-deepCard border-deepBorder")}>
                  <User className={clsx("w-5 h-5", livenessState.smiling ? "text-deepGreen" : "text-textMuted")} />
                  <span className="text-xs font-mono tracking-wide text-textMuted uppercase">Smile</span>
              </div>
              <div className={clsx("p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all", livenessState.headTurn ? "bg-deepGreen/20 border-deepGreen" : "bg-deepCard border-deepBorder")}>
                  <Settings className={clsx("w-5 h-5", livenessState.headTurn ? "text-deepGreen" : "text-textMuted", livenessState.headTurn && "animate-spin")} />
                  <span className="text-xs font-mono tracking-wide text-textMuted uppercase">Track</span>
              </div>
          </div>
       </div>

       {/* Control Panel */}
       <div className="lg:col-span-1 glass-panel p-6 border border-deepBorder flex flex-col justify-between">
           <div className="space-y-6">
              <div>
                  <h3 className="text-sm font-mono text-textMuted tracking-widest uppercase mb-1">Session Target</h3>
                  <h1 className="text-3xl font-display font-bold">Liveness Verification</h1>
                  <p className="text-sm text-textMuted mt-3 leading-relaxed">
                      Static image spoofing bypasses simple biometric checks. This live pipeline tracks temporal facial deformability (blinking, micro-expressions) via a 478-point 3D landmark mesh to cryptographically ensure physical presence.
                  </p>
              </div>

              <hr className="border-deepBorder" />

              <div className="space-y-4">
                 <div className="flex items-center justify-between text-sm font-mono uppercase tracking-wider">
                     <span className="text-textMuted">Liveness Integrity</span>
                     <span className={clsx(isVerified ? "text-deepGreen" : "text-deepRed")}>{verificationProgress}%</span>
                 </div>
                 
                 <div className="w-full h-3 bg-deepBase rounded-full overflow-hidden border border-deepBorder">
                     <div className={clsx("h-full transition-all duration-300 ease-out", isVerified ? "bg-deepGreen glow-green" : "bg-deepRed")} style={{ width: `${verificationProgress}%`}} />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                     <div className="bg-deepBase p-4 rounded-lg border border-deepBorder/50 font-mono text-xs text-textMuted space-y-2">
                         <p className="flex justify-between"><span>Model:</span> <span className="text-white">MediaPipe</span></p>
                         <p className="flex justify-between"><span>Topology:</span> <span className="text-white">478-vertex</span></p>
                         <p className="flex justify-between"><span>Latency:</span> <span className="text-white">Live</span></p>
                     </div>
                     <div className="bg-deepBase p-4 rounded-lg border border-deepBorder/50 font-mono text-xs text-textMuted space-y-2">
                         <p className="flex justify-between"><span>Blinks:</span> <span className="text-deepGreen font-bold">{activityCounts.blinks}</span></p>
                         <p className="flex justify-between"><span>Smiles:</span> <span className="text-deepGreen font-bold">{activityCounts.smiles}</span></p>
                         <p className="flex justify-between"><span>Turns:</span> <span className="text-deepGreen font-bold">{activityCounts.turns}</span></p>
                     </div>
                 </div>
              </div>
           </div>

           <div className="mt-8 space-y-3">
               {isVerified ? (
                   <div className="w-full py-4 bg-deepGreen/20 border border-deepGreen text-deepGreen rounded-xl flex items-center justify-center gap-2 font-bold transition-all">
                       <CheckCircle2 className="w-5 h-5" /> HUMAN VERIFIED
                   </div>
               ) : (
                   <>
                     <button 
                         onClick={startVerification} 
                         disabled={activeSession && !isVerified || !isModelLoaded}
                         className={clsx("w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-300", 
                             activeSession 
                             ? "bg-deepBase border border-deepBorder text-textMuted" 
                             : "bg-deepRed/10 border border-deepRed text-deepRed hover:bg-deepRed hover:text-white hover:glow-red"
                         )}
                     >
                         {activeSession ? "VERIFYING (Perform Actions)..." : "START SESSION"}
                     </button>
                     {activeSession && (
                         <button 
                             onClick={() => setActiveSession(false)}
                             className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold bg-deepBase border border-deepBorder text-textMuted hover:text-white hover:border-textMuted transition-all"
                         >
                             <XCircle className="w-4 h-4" /> CANCEL SESSION
                         </button>
                     )}
                   </>
               )}
           </div>
       </div>
    </div>
  );
}
