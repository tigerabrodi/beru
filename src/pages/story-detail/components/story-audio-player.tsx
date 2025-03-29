import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type StoryAudioPlayerProps = {
  audioUrl: string | null
  audioStatus: 'pending' | 'generating' | 'ready' | 'error'
  clientSideAudioStatus: 'pending' | 'generating' | 'ready' | 'error'
  onRetry: () => Promise<void>
}

function LoadingText({
  clientSideAudioStatus,
  audioStatus,
}: Pick<StoryAudioPlayerProps, 'clientSideAudioStatus' | 'audioStatus'>) {
  // first check if the audio is generating
  // if it is, show it
  if (audioStatus === 'generating') {
    return (
      <p className="text-sm font-medium">
        Generating voice... (takes a few minutes)
      </p>
    )
  }

  // show preparing audio right away if client side is generating
  // this way UI is more responsive
  if (audioStatus === 'pending' || clientSideAudioStatus === 'generating') {
    return <p className="text-sm font-medium">Preparing audio...</p>
  }
}

export function StoryAudioPlayer({
  audioUrl,
  audioStatus,
  clientSideAudioStatus,
  onRetry,
}: StoryAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio element
    const audio = new Audio(audioUrl || undefined)
    audioRef.current = audio

    // Set initial volume
    audio.volume = volume

    // Set up event listeners
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)

    // Clean up on unmount
    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
    }

    // we don't wanna recreate this when volume changes
    // otherwise it'll restart the story and things break
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl])

  // Handle volume changes separately
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  // Update audio src when audioUrl changes
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl
      audioRef.current.load()
    }
  }, [audioUrl])

  const togglePlayPause = () => {
    if (audioStatus !== 'ready' || !audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error)
      })
    }

    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: Array<number>) => {
    const newTime = value[0]
    setCurrentTime(newTime)

    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const handleVolumeChange = (value: Array<number>) => {
    const newVolume = value[0]
    setVolume(newVolume)
    setIsMuted(newVolume === 0)

    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const toggleMute = () => {
    const isMutedNew = !isMuted
    setIsMuted(isMutedNew)

    if (audioRef.current) {
      audioRef.current.volume = isMutedNew ? 0 : volume
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-muted/30 w-full rounded-lg p-4">
      {audioStatus === 'pending' ||
      audioStatus === 'generating' ||
      clientSideAudioStatus === 'generating' ? (
        <div className="flex items-center justify-center py-4">
          <div className="flex flex-col items-center gap-2">
            <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            <LoadingText
              clientSideAudioStatus={clientSideAudioStatus}
              audioStatus={audioStatus}
            />
          </div>
        </div>
      ) : audioStatus === 'error' ? (
        <div className="flex items-center justify-center gap-4 py-4">
          <p className="text-sm text-red-500">
            There was an error generating the audio. Please try again later.
          </p>
          <Button variant="outline" onClick={onRetry}>
            Try generating again
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">
              {formatTime(currentTime)} / {formatTime(duration || 0)}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="size-4" />
                ) : (
                  <Volume2 className="size-4" />
                )}
                <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-24"
              />
            </div>
          </div>

          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 1}
            step={0.01}
            onValueChange={handleSeek}
            className="w-full"
            disabled={!audioUrl || audioStatus !== 'ready'}
          />

          <div className="flex items-center justify-center">
            <Button
              size="icon"
              onClick={togglePlayPause}
              className="size-12 rounded-full"
              disabled={!audioUrl || audioStatus !== 'ready'}
            >
              {isPlaying ? (
                <Pause className="size-6" />
              ) : (
                <Play className="ml-1 size-6" />
              )}
              <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
