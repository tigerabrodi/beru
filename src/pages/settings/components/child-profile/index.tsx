import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@convex/_generated/api'
import { Doc, Id } from '@convex/_generated/dataModel'
import { useMutation, useQuery } from 'convex/react'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { AddChildProfileDialog } from './add-child-profile-dialog'
import { DeleteChildProfileDialog } from './delete-child-profile-dialog'
import { EditChildProfileDialog } from './edit-child-profile-dialog'

export function ChildProfileSettings() {
  const childProfiles = useQuery(api.childProfiles.queries.getChildProfiles)
  const addChildProfile = useMutation(
    api.childProfiles.mutations.createChildProfile
  )
  const updateChildProfile = useMutation(
    api.childProfiles.mutations.updateChildProfile
  )
  const deleteChildProfile = useMutation(
    api.childProfiles.mutations.deleteChildProfile
  )

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingProfileId, setEditingProfileId] =
    useState<Id<'childProfiles'> | null>(null)

  const [deletingProfileState, setDeletingProfileState] = useState<{
    name: string
    id: Id<'childProfiles'> | null
  }>({
    name: '',
    id: null,
  })

  const [initialEditProfileState, setInitialEditProfileState] = useState({
    name: '',
    age: '',
    interests: '',
  })

  const resetInitialEditProfileState = () => {
    setInitialEditProfileState({
      name: '',
      age: '',
      interests: '',
    })
    setEditingProfileId(null)
  }

  const handleAddProfile = async (profile: {
    name: string
    age: number
    interests: string
  }) => {
    // error handling is done in the dialog
    return await addChildProfile(profile)
  }

  const handleEditProfile = async (
    profileId: string,
    profile: {
      name: string
      age: number
      interests: string
    }
  ) => {
    return await updateChildProfile({
      childId: profileId as Id<'childProfiles'>,
      ...profile,
    })
  }

  const openDeleteDialog = (profile: Doc<'childProfiles'>) => {
    setDeletingProfileState({
      name: profile.name,
      id: profile._id,
    })
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteProfile = async (
    deletingProfileId: Id<'childProfiles'>
  ) => {
    return await deleteChildProfile({
      childId: deletingProfileId,
    })
  }

  const openEditDialog = (profile: Doc<'childProfiles'>) => {
    setEditingProfileId(profile._id)
    setInitialEditProfileState({
      name: profile.name,
      age: profile.age.toString(),
      interests: profile.interests,
    })
    setIsEditDialogOpen(true)
  }

  if (childProfiles === undefined) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 md:gap-0">
          <div>
            <h2 className="mb-2 text-xl font-bold">Child Profiles</h2>
            <p className="text-muted-foreground">
              Manage saved profiles for quick story generation
            </p>
          </div>

          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid max-h-[450px] grid-cols-1 gap-4 overflow-y-auto pr-2 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 md:gap-0">
        <div>
          <h2 className="mb-2 text-xl font-bold">Child Profiles</h2>
          <p className="text-muted-foreground">
            Manage saved profiles for quick story generation
          </p>
        </div>

        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="size-4" />
          Add Profile
        </Button>
      </div>

      {childProfiles.length === 0 ? (
        <div className="bg-muted/30 rounded-lg border py-8 text-center">
          <p className="text-muted-foreground">No child profiles yet</p>
          <Button
            variant="link"
            onClick={() => setIsAddDialogOpen(true)}
            className="mt-2"
          >
            Add your first profile
          </Button>
        </div>
      ) : (
        <div className="grid max-h-[450px] grid-cols-1 gap-4 overflow-y-auto pr-2 md:grid-cols-2">
          {childProfiles.map((profile) => (
            <Card key={profile._id}>
              <CardHeader>
                <CardTitle>
                  {profile.name}, {profile.age} years old
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  <strong>Interests:</strong> {profile.interests}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openDeleteDialog(profile)}
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openEditDialog(profile)}
                >
                  <Edit className="size-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AddChildProfileDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddProfile={handleAddProfile}
      />

      <EditChildProfileDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        profileId={editingProfileId}
        key={editingProfileId}
        initialEditProfileState={initialEditProfileState}
        onEditProfile={handleEditProfile}
        onSuccess={resetInitialEditProfileState}
      />

      <DeleteChildProfileDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        deleteProfileState={deletingProfileState}
        onDelete={handleDeleteProfile}
        onSuccess={() => {
          setDeletingProfileState({
            name: '',
            id: null,
          })
        }}
      />
    </div>
  )
}
