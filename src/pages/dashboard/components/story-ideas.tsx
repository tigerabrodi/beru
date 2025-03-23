import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StoryIdeasType } from '@convex/stories/actions'
import { motion } from 'motion/react'

type StoryIdeasProps = {
  ideas: StoryIdeasType
  onSelectIdea: (ideaId: string) => void
}

export function StoryIdeas({ ideas, onSelectIdea }: StoryIdeasProps) {
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
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <h3 className="mb-2 text-lg font-medium">{idea.title}</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  A personalized story based on this theme
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  type="button"
                  onClick={() => onSelectIdea(idea.id)}
                >
                  Select This Idea
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
