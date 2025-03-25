import { Card, CardContent } from '@/components/ui/card'
import { StoryIdeasType } from '@convex/stories/actions'
import { Loader2 } from 'lucide-react'
import { motion } from 'motion/react'

type StoryIdeasProps = {
  ideas: StoryIdeasType
  onSelectIdea: (ideaId: string) => void
  isGeneratingStory: boolean
  generatingStoryId: string
}

export function StoryIdeas({
  ideas,
  onSelectIdea,
  isGeneratingStory,
  generatingStoryId,
}: StoryIdeasProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Story Ideas</h2>
      <p className="text-muted-foreground">
        Click on an idea to generate a full story
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {ideas.map((idea, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="relative h-[200px] transition-shadow duration-200 hover:shadow-md">
              {/* TODO: add loading state for beru */}
              {generatingStoryId === idea.id && (
                <Loader2 className="text-muted-foreground absolute top-2 right-2 size-4 animate-spin" />
              )}
              <button
                className="w-full disabled:cursor-wait disabled:opacity-75"
                type="button"
                onClick={() => onSelectIdea(idea.id)}
                disabled={isGeneratingStory}
              >
                <CardContent className="flex flex-col gap-2 p-6">
                  <h3 className="line-clamp-2 text-lg font-medium">
                    {idea.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    A personalized story based on this theme
                  </p>
                </CardContent>
              </button>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
