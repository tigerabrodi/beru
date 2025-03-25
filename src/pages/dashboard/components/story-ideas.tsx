import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
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
            <Card
              className={cn(
                'relative transition-shadow duration-200 hover:shadow-md',
                {
                  // this is the original shadow inside card
                  // we're just reverting
                  'hover:shadow-sm': isGeneratingStory,
                }
              )}
            >
              {generatingStoryId === idea.id && (
                <Loader2 className="text-muted-foreground absolute top-2 right-2 size-4 animate-spin" />
              )}
              <button
                // ! is important here to override the default cursor
                className="w-full disabled:cursor-auto! disabled:opacity-75"
                type="button"
                onClick={() => onSelectIdea(idea.id)}
                disabled={isGeneratingStory}
              >
                <CardContent className="flex h-full flex-col gap-2 overflow-y-auto p-6">
                  <h3 className="line-clamp-2 text-lg font-medium">
                    {idea.title}
                  </h3>
                  <p className="text-muted-foreground h-full overflow-y-auto text-sm">
                    {idea.description}
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
