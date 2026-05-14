'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X } from 'lucide-react'

type FaceDetectorCtor = new (options?: { fastMode?: boolean; maxDetectedFaces?: number }) => {
  detect: (input: CanvasImageSource) => Promise<Array<Record<string, unknown>>>
}

declare global {
  interface Window {
    FaceDetector?: FaceDetectorCtor
  }
}

export default function EmployeeHomePage() {
  const empName = 'Raj Kumar'
  const empId = 'EMP-001234'
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? '🌅 Good Morning' : currentHour < 17 ? '☀️ Good Afternoon' : '🌙 Good Evening'

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [showFaceModal, setShowFaceModal] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [faceSnapshot, setFaceSnapshot] = useState<string | null>(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const [faceRecognized, setFaceRecognized] = useState(false)
  const [recognitionScore, setRecognitionScore] = useState(0)
  const [checkInStatus, setCheckInStatus] = useState<'idle' | 'checking' | 'success' | 'failed'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function startCamera() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 360 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraReady(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Camera access failed')
    }
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  async function detectFaceOnCurrentFrame(): Promise<boolean> {
    if (!videoRef.current) return false
    if (typeof window !== 'undefined' && window.FaceDetector) {
      try {
        const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 })
        const faces = await detector.detect(videoRef.current)
        return faces.length > 0
      } catch {
        return false
      }
    }
    return true
  }

  function compareSnapshotWithStoredFace(snapshot: string): number {
    // Mock face recognition - compares snapshot against stored employee face
    // In production, use TensorFlow.js face recognition or AWS Rekognition
    // For demo: generate confidence score based on face quality
    
    const canvas = document.createElement('canvas')
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        // Calculate brightness and contrast (simple quality metrics)
        let brightness = 0
        for (let i = 0; i < data.length; i += 4) {
          brightness += (data[i] + data[i + 1] + data[i + 2]) / 3
        }
        brightness /= data.length / 4
        
        // Mock confidence: 75-95% based on image quality
        const qualityScore = Math.min(95, 75 + (brightness / 255) * 20)
        setRecognitionScore(qualityScore)
      }
    }
    img.src = snapshot
    return 80 // Mock: 80% confidence for demo
  }

  async function captureFaceForRecognition() {
    if (!videoRef.current || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    setCheckInStatus('checking')
    setBusy(true)

    try {
      // Capture frame
      const width = videoRef.current.videoWidth
      const height = videoRef.current.videoHeight
      canvasRef.current.width = width
      canvasRef.current.height = height
      ctx.drawImage(videoRef.current, 0, 0, width, height)
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9)
      setFaceSnapshot(dataUrl)

      // Detect face
      const detected = await detectFaceOnCurrentFrame()
      setFaceDetected(detected)

      if (!detected) {
        setError('Face not detected. Please keep your face centered.')
        setCheckInStatus('failed')
        setBusy(false)
        return
      }

      // Simulate recognition delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Compare with stored face
      const confidence = compareSnapshotWithStoredFace(dataUrl)

      // Mock: randomly succeed/fail for demo (80% success rate with good face detection)
      if (confidence >= 75) {
        setFaceRecognized(true)
        setCheckInStatus('success')
      } else {
        setError('Face not recognized. Please try again.')
        setCheckInStatus('failed')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Recognition failed')
      setCheckInStatus('failed')
    } finally {
      setBusy(false)
    }
  }

  function handleCheckIn() {
    if (!faceRecognized) {
      setShowFaceModal(true)
      return
    }
    // Perform check-in with verified face
    alert(`✅ Checked In: ${empName} at ${new Date().toLocaleTimeString()}`)
    setShowFaceModal(false)
  }

  const widgets = [
    { icon: '🕐', label: 'Shift Status', value: '9 AM - 6 PM', color: '#60a5fa', action: '/employee/attendance' },
    { icon: '✅', label: 'Attendance', value: '94.2%', color: '#34d399', action: '/employee/attendance' },
    { icon: '🌴', label: 'Leave Balance', value: '8 PL, 2 CL', color: '#a78bfa', action: '/employee/leave' },
    { icon: '💰', label: 'Incentive', value: '₹12,500', color: '#FFB347', action: '/employee/incentives' },
  ]

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: '#fff' }}>{greeting}</h1>
            <p style={{ fontSize: '13px', color: '#999', margin: '4px 0 0' }}>{empName} • {empId}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: '2-digit' })}</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Action */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ marginBottom: '32px' }}>
        <button
          onClick={handleCheckIn}
          style={{
            width: '100%',
            padding: '16px',
            background: faceRecognized ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' : 'linear-gradient(135deg, #FF6B35 0%, #FFB347 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
        >
          {faceRecognized ? '✅ FACE VERIFIED - PUNCH IN' : '⏱️ PUNCH IN (Face Recognition)'}
        </button>
      </motion.div>

      {/* Widgets Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {widgets.map((w, i) => (
          <Link key={i} href={w.action} style={{ textDecoration: 'none' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }} whileHover={{ scale: 1.02 }} style={{
              background: '#0f0f0f', border: `1px solid ${w.color}22`, borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s'
            }}>
              <p style={{ fontSize: '24px', margin: 0, marginBottom: '8px' }}>{w.icon}</p>
              <p style={{ fontSize: '11px', color: '#999', margin: 0, marginBottom: '6px', textTransform: 'uppercase', fontWeight: 600 }}>{w.label}</p>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>{w.value}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Attendance Widget */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{
        background: '#0f0f0f', border: '1px solid rgba(255,140,66,0.1)', borderRadius: '12px', padding: '20px', marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px', color: '#fff' }}>📅 This Week</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
            const status = i < 5 ? '✓' : i === 5 ? '−' : '○'
            const colors = { '✓': '#34d399', '−': '#FFB347', '○': '#999' }
            return (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '10px', color: '#666', margin: '0 0 6px' }}>{day}</p>
                <div style={{ width: '36px', height: '36px', margin: '0 auto', background: '#1a1a1a', border: `2px solid ${(colors as any)[status]}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: (colors as any)[status] }}>
                  {status}
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{
        background: 'rgba(255,140,66,0.08)', border: '1px solid rgba(255,140,66,0.2)', borderRadius: '12px', padding: '16px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px', color: '#FF6B35' }}>🔔 Notifications</h3>
        <div style={{ fontSize: '12px', color: '#ccc' }}>
          <p style={{ margin: '8px 0' }}>✓ Shift roster updated for next week</p>
          <p style={{ margin: '8px 0' }}>✓ May incentive payout released</p>
          <p style={{ margin: '8px 0' }}>✓ New attendance policy available</p>
        </div>
      </motion.div>

      {/* Face Recognition Modal */}
      <AnimatePresence>
        {showFaceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => !busy && setShowFaceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#0a0a0a',
                border: '1px solid rgba(255,140,66,0.3)',
                borderRadius: '16px',
                padding: '28px',
                maxWidth: '420px',
                width: '90vw',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Face Recognition Punch In</h2>
                <button
                  onClick={() => {
                    setShowFaceModal(false)
                    setFaceRecognized(false)
                    setFaceSnapshot(null)
                    setCheckInStatus('idle')
                    if (streamRef.current) {
                      streamRef.current.getTracks().forEach((t) => t.stop())
                    }
                  }}
                  style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 0 }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Video Feed or Snapshot */}
              <div style={{ marginBottom: '16px' }}>
                {!faceSnapshot ? (
                  <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#1a1a1a', minHeight: '240px' }}>
                    <video
                      ref={videoRef}
                      style={{
                        width: '100%',
                        height: '240px',
                        objectFit: 'cover',
                        display: cameraReady ? 'block' : 'none',
                      }}
                      playsInline
                      muted
                    />
                    {!cameraReady && (
                      <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                        <p>Starting camera...</p>
                      </div>
                    )}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                  </div>
                ) : (
                  <img
                    src={faceSnapshot}
                    alt="Face snapshot"
                    style={{ width: '100%', borderRadius: '12px', maxHeight: '240px', objectFit: 'cover' }}
                  />
                )}
              </div>

              {/* Status Messages */}
              {error && (
                <div style={{ padding: '12px', background: 'rgba(252,165,165,0.1)', border: '1px solid #fca5a5', borderRadius: '8px', marginBottom: '16px', color: '#fca5a5', fontSize: '12px' }}>
                  {error}
                </div>
              )}

              {/* Recognition Score */}
              {faceDetected && recognitionScore > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                    <span>Face Recognition Score</span>
                    <span style={{ fontWeight: 700, color: recognitionScore >= 75 ? '#34d399' : '#FFB347' }}>{recognitionScore.toFixed(1)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#1a1a1a', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${recognitionScore}%`,
                        height: '100%',
                        background: recognitionScore >= 75 ? '#34d399' : '#FFB347',
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Status Indicator */}
              {checkInStatus === 'checking' && (
                <div style={{ textAlign: 'center', marginBottom: '16px', padding: '12px' }}>
                  <div style={{ display: 'inline-block', width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #FF6B35', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                  <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#999' }}>Recognizing face...</p>
                </div>
              )}

              {checkInStatus === 'success' && (
                <div style={{ textAlign: 'center', marginBottom: '16px', padding: '12px' }}>
                  <p style={{ fontSize: '32px', margin: 0, marginBottom: '8px' }}>✅</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#34d399', fontWeight: 700 }}>Face Recognized!</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#999' }}>Welcome back, {empName}</p>
                </div>
              )}

              {checkInStatus === 'failed' && (
                <div style={{ textAlign: 'center', marginBottom: '16px', padding: '12px' }}>
                  <p style={{ fontSize: '32px', margin: 0, marginBottom: '8px' }}>❌</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#fca5a5', fontWeight: 700 }}>Recognition Failed</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#999' }}>Please try again</p>
                </div>
              )}

              {/* Action Buttons */}
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>

              <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr' }}>
                {!faceSnapshot ? (
                  <>
                    <button
                      onClick={() => void startCamera()}
                      disabled={busy || cameraReady}
                      style={{
                        padding: '12px',
                        background: cameraReady ? '#1a1a1a' : '#FF6B35',
                        color: cameraReady ? '#999' : '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: cameraReady ? 'default' : 'pointer',
                        opacity: busy ? 0.5 : 1,
                      }}
                    >
                      {cameraReady ? '✓ Camera Ready' : 'Start Camera'}
                    </button>
                    <button
                      onClick={() => void captureFaceForRecognition()}
                      disabled={!cameraReady || busy}
                      style={{
                        padding: '12px',
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: !cameraReady || busy ? 'not-allowed' : 'pointer',
                        opacity: !cameraReady || busy ? 0.5 : 1,
                      }}
                    >
                      Capture Face
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setFaceSnapshot(null)
                        setCheckInStatus('idle')
                        setError(null)
                        void startCamera()
                      }}
                      disabled={busy}
                      style={{
                        padding: '12px',
                        background: '#1a1a1a',
                        color: '#fff',
                        border: '1px solid rgba(255,140,66,0.3)',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => {
                        if (faceRecognized) {
                          alert(`✅ Checked In: ${empName} at ${new Date().toLocaleTimeString()}`)
                          setShowFaceModal(false)
                          setFaceRecognized(false)
                          setFaceSnapshot(null)
                          setCheckInStatus('idle')
                        }
                      }}
                      disabled={checkInStatus !== 'success'}
                      style={{
                        padding: '12px',
                        background: checkInStatus === 'success' ? '#34d399' : '#1a1a1a',
                        color: checkInStatus === 'success' ? '#000' : '#999',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: checkInStatus === 'success' ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Check In
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}