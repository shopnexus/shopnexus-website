import { useState } from "react"
import { Plus, Edit2, Trash2, Search, Tag } from "lucide-react"
import Button from "../../../components/ui/Button"
import Card from "../../../components/ui/Card"
import Modal from "../../../components/ui/Modal"
import { useInfiniteQuery, useMutation } from "@connectrpc/connect-query"
import {
	createTag,
	deleteTag,
	listTags,
	updateTag,
} from "shopnexus-protobuf-gen-ts"

interface Tag {
	id: string
	name: string
	description: string
	productCount: number
	color: string
	createdAt: string
}

const TagManagement = () => {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
	const [searchQuery, setSearchQuery] = useState("")
	const [tag, setTag] = useState({
		name: "",
		description: "",
	})

	const { data, fetchNextPage, hasNextPage, isLoading, refetch } =
		useInfiniteQuery(
			listTags,
			{
				pagination: {
					page: 1,
					limit: 10,
				},
				description: searchQuery,
			},
			{
				pageParamKey: "pagination",
				getNextPageParam: (lastPage) => {
					if (!lastPage.pagination?.nextPage) return undefined
					return {
						page: lastPage.pagination.nextPage,
						limit: lastPage.pagination.limit,
					}
				},
			}
		)

	// Flatten the pages data into a single array of tags
	const tags = data?.pages.flatMap((page) => page.data || []) || []

	const { mutateAsync: mutateCreateTag } = useMutation(createTag, {
		onSuccess: () => refetch(),
	})

	const { mutateAsync: mutateUpdateTag } = useMutation(updateTag, {
		onSuccess: () => refetch(),
	})

	const { mutateAsync: mutateDeleteTag } = useMutation(deleteTag, {
		onSuccess: () => refetch(),
	})

	const handleOpenModal = (existingTag?: Tag) => {
		if (existingTag) {
			setSelectedTag(existingTag)
			setTag({
				name: existingTag.name,
				description: existingTag.description,
			})
		} else {
			setSelectedTag(null)
			setTag({
				name: "",
				description: "",
			})
		}
		setIsModalOpen(true)
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setSelectedTag(null)
	}

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target
		setTag((prev) => ({
			...prev,
			[name]: value,
		}))
	}

	const handleSubmit = async () => {
		try {
			if (selectedTag) {
				// Update existing tag
				await mutateUpdateTag({
					tag: tag.name,
					description: tag.description,
				})
			} else {
				// Add new tag
				await mutateCreateTag({
					tag: tag.name,
					description: tag.description,
				})
			}
			handleCloseModal()
		} catch (error) {
			console.error("Error saving tag:", error)
			alert("Failed to save tag. Please try again.")
		}
	}

	const handleDelete = async () => {
		if (window.confirm("Are you sure you want to delete this tag?")) {
			try {
				await mutateDeleteTag({ tag: tag.name })
			} catch (error) {
				console.error("Error deleting tag:", error)
				alert("Failed to delete tag. Please try again.")
			}
		}
	}

	// Handle search with debounce
	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value)
		// Refetch when search query changes
		setTimeout(() => refetch(), 300)
	}

	const renderTableBody = () => {
		if (isLoading) {
			return (
				<tr>
					<td colSpan={5} className="px-6 py-4 text-center">
						Loading tags...
					</td>
				</tr>
			)
		}

		if (tags.length === 0) {
			return (
				<tr>
					<td colSpan={5} className="px-6 py-4 text-center">
						No tags found.
					</td>
				</tr>
			)
		}

		return tags.map((tag) => (
			<tr key={tag.id}>
				<td className="px-6 py-4">
					<div className="flex items-center space-x-2">
						<span
							className="w-3 h-3 rounded-full"
							style={{ backgroundColor: tag.color }}
						/>
						<span className="font-medium">{tag.name}</span>
					</div>
				</td>
				<td className="px-6 py-4 text-gray-500">{tag.description}</td>
				<td className="px-6 py-4">
					<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
						{tag.productCount} products
					</span>
				</td>
				<td className="px-6 py-4 text-gray-500">
					{new Date(tag.createdAt).toLocaleDateString()}
				</td>
				<td className="px-6 py-4">
					<div className="flex space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleOpenModal(tag)}
						>
							<Edit2 className="w-4 h-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleDelete(tag.id)}
						>
							<Trash2 className="w-4 h-4" />
						</Button>
					</div>
				</td>
			</tr>
		))
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Tags</h1>
				<div className="flex items-center space-x-4">
					<div className="relative">
						<Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search tags..."
							value={searchQuery}
							onChange={handleSearch}
							className="pl-10 pr-4 py-2 border rounded-lg w-64"
						/>
					</div>
					<Button
						onClick={() => handleOpenModal()}
						className="flex items-center"
					>
						<Plus className="w-4 h-4 mr-2" />
						Add Tag
					</Button>
				</div>
			</div>

			<Card>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Tag
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Description
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Products
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Created
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{renderTableBody()}
						</tbody>
					</table>
				</div>

				{hasNextPage && (
					<div className="flex justify-center mt-4 pb-4">
						<Button
							variant="outline"
							onClick={() => fetchNextPage()}
							disabled={isLoading}
						>
							Load More
						</Button>
					</div>
				)}
			</Card>

			<Modal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={selectedTag ? "Edit Tag" : "Add New Tag"}
			>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Tag Name
						</label>
						<input
							type="text"
							name="name"
							value={tag.name}
							onChange={handleChange}
							className="w-full px-3 py-2 border rounded-lg"
							placeholder="Enter tag name"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Description
						</label>
						<textarea
							name="description"
							value={tag.description}
							onChange={handleChange}
							rows={3}
							className="w-full px-3 py-2 border rounded-lg"
							placeholder="Enter tag description"
						/>
					</div>
				</div>

				<div className="flex justify-end space-x-2 mt-6">
					<Button variant="outline" onClick={handleCloseModal}>
						Cancel
					</Button>
					<Button onClick={handleSubmit}>
						{selectedTag ? "Update" : "Add"} Tag
					</Button>
				</div>
			</Modal>
		</div>
	)
}

export default TagManagement
