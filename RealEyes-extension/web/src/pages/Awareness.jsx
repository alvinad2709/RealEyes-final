import { Shield, BookOpen, AlertTriangle, Cpu, TrendingUp, Search, Eye } from 'lucide-react';

export default function Awareness() {
  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12 animate-fade-in relative">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/3 left-0 w-[500px] h-[500px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

      {/* Header */}
      <div className="mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-deepCard border border-deepBorder rounded-full mb-6 shadow-lg shadow-black/20">
          <BookOpen className="w-4 h-4 text-deepRed" />
          <span className="text-xs font-mono text-textMuted uppercase tracking-wider">RealEyes Education Hub</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tight mb-4">
          Understanding <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-deepRed to-red-400 glow-text-red">Synthetic Media</span>
        </h1>
        <p className="text-lg text-textMuted max-w-2xl leading-relaxed">
          The threat landscape is changing. As generative AI becomes democratized, distinguishing between cryptographic reality and synthetic fabrications is no longer a human endeavor—it requires robust algorithmic defense.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          
          <section className="glass-panel p-8 rounded-2xl bg-deepBase/60 border border-deepBorder/50 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <Cpu className="w-8 h-8 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">The Architecture of a Deepfake</h2>
            </div>
            <div className="space-y-4 text-textMuted leading-relaxed">
              <p>
                Deepfakes rely primarily on two types of deep learning architectures: <strong className="text-white">Generative Adversarial Networks (GANs)</strong> and <strong className="text-white">Autoencoders</strong>.
              </p>
              <p>
                In a standard Autoencoder setup, an encoder neural network compresses an image of a target face into a lower-dimensional latent space. A decoder is then trained to rebuild the face from that latent representation. To execute a face-swap deepfake, the attacker feeds the source face through the target's decoder, forcing the algorithm to reconstruct the target's likeness using the expressions and movements of the source.
              </p>
              <p>
                Modern iterations utilize Diffusion Models and Vision Transformers, which generate entirely synthetic humans or synthesize high-fidelity voice cloning using just 3 seconds of audio data.
              </p>
            </div>
          </section>

          <section className="glass-panel p-8 rounded-2xl bg-deepBase/60 border border-deepBorder/50 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-8 h-8 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Visual Artifacts: How to Spot Manipulation</h2>
            </div>
            <div className="space-y-4 text-textMuted leading-relaxed">
              <p>
                While algorithms are mastering generation, the encoding/decoding process often leaves microscopic visual footprints (artifacts) that betray the synthesis. Common forensic indicators include:
              </p>
              <ul className="space-y-3 mt-4 ml-4 list-none">
                <li className="flex items-start gap-3">
                  <span className="text-deepRed mt-1">▹</span>
                  <span><strong>Unnatural Blinking:</strong> Early generative models were trained on static images where human eyes are typically open, resulting in deepfakes that blink abnormally or not at all.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-deepRed mt-1">▹</span>
                  <span><strong>Boundary Blurring (Blending):</strong> The AI must stitch the generated face onto the original head. This often causes severe pixel distortion along the jawline, neck, and hairline.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-deepRed mt-1">▹</span>
                  <span><strong>Dental Inconsistencies:</strong> Neural networks struggle severely with teeth. They frequently render teeth as a unibody blob of white pixels rather than distinct, individual structures.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-deepRed mt-1">▹</span>
                  <span><strong>Lighting Asymmetry:</strong> The synthetic face may have shadows that contradict the natural lighting of the surrounding room or background.</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="glass-panel p-8 rounded-2xl bg-deepBase/60 border border-deepBorder/50 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-orange-400" />
              <h2 className="text-2xl font-bold text-white">Real-World Case Studies</h2>
            </div>
            <div className="space-y-4 text-textMuted leading-relaxed">
              <p>
                The financial implications of synthetic media aren't theoretical—they are already occurring at scale in corporate environments, targeting the human element of security protocols.
              </p>
              <div className="mt-6 p-5 border border-deepRed/50 bg-deepRed/10 rounded-xl">
                <h3 className="text-white font-bold text-lg mb-2">The $25.6 Million "Phantom CFO" Heist (2024)</h3>
                <p className="text-sm">
                  In early 2024, a finance worker at a multinational firm's Hong Kong branch was defrauded of HK$200M (approx. $25.6M USD). Scammers used publicly available video and audio footage to build highly-trained, live deepfake overlays. The employee was invited to a video conference where the synthetic "CFO" and several recognized colleagues were present in real-time. Convinced by the authenticity of the deepfake architecture, the employee executed 15 separate wire transfers. The fraud was only discovered a week later, proving that <strong className="text-white">human verification is no longer reliable over digital channels.</strong>
                </p>
              </div>
            </div>
          </section>

        </div>

        {/* Sidebar / Stats */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl bg-deepCard border border-deepRed/30 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-deepRed/10 rounded-full blur-[40px]" />
            <AlertTriangle className="w-8 h-8 text-deepRed mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">The Escalating Threat</h3>
            <p className="text-sm text-textMuted mb-6 leading-relaxed">
              According to recent cybersecurity datasets, synthetic media fraud attempts have increased exponentially year-over-year.
            </p>
            <div className="space-y-4">
               <div className="flex justify-between items-center border-b border-deepBorder pb-2">
                 <span className="text-sm text-gray-400">Audio Deepfakes</span>
                 <span className="text-lg font-mono text-white tracking-widest">+420%</span>
               </div>
               <div className="flex justify-between items-center border-b border-deepBorder pb-2">
                 <span className="text-sm text-gray-400">Financial Fraud</span>
                 <span className="text-lg font-mono text-white tracking-widest">$3B+</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-sm text-gray-400">Human Accuracy</span>
                 <span className="text-lg font-mono text-red-400 tracking-widest">{"< 60%"}</span>
               </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl bg-deepBase/80 border border-deepBorder backdrop-blur-md">
             <Shield className="w-8 h-8 text-green-400 mb-4" />
             <h3 className="text-xl font-bold text-white mb-2">Why RealEyes AI?</h3>
             <p className="text-sm text-textMuted leading-relaxed">
               The human eye is no longer sufficient. Human accuracy in detecting state-of-the-art deepfakes hovers below 60%—worse than random guessing. RealEyes uses Vision Transformers (SwinV2) to evaluate high-frequency spatial noise and algorithmic footprints invisible to the naked eye.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
