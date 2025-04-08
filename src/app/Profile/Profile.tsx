// src/components/Profile.tsx
import { useQuery } from "@connectrpc/connect-query"
import React from "react"
import { getUser } from "shopnexus-protobuf-gen-ts"

const Profile: React.FC = () => {
	const { data: user, isLoading } = useQuery(getUser)

	const handleLogout = () => {
		// Chuyển hướng về trang đăng nhập (tuỳ thuộc vào router bạn đang dùng)
		localStorage.removeItem("token")
		window.location.href = "/login"
	}

	//goi ham toi trang edit profile
	const handleProfile = () => {
		
	}

	if (isLoading || !user) {
		return <div>Loading...</div>
	}

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
				<div className="flex flex-col items-center gap-4">
					<img
						// src={user.avatar}
						src="/placeholder3.jpeg"
						alt={`${user.username}'s avatar`}
						className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
					/>

					<div className="text-center">
						<h1 className="text-2xl font-bold text-gray-900">
							{user.fullName}
						</h1>
						<p className="text-gray-600">{user.email}</p>
						{/* {user.bio && <p className="mt-2 text-gray-700">{user.bio}</p>} */}
					</div>

					<div className="w-full flex flex-col gap-3">
						<button 
						onClick={handleProfile}
						className="cursor-pointer w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200">
							Edit Profile
						</button>
						<button
							className="cursor-pointer w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors duration-200"
							onClick={handleLogout}
						>
							Logout
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Profile
