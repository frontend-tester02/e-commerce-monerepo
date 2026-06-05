import { cookies } from 'next/headers'
import { ThemeProvider } from '../../../components/providers/ThemeProvider'
import { SidebarProvider } from '../../../components/ui/sidebar'
import AppSidebar from '../../../components/shared/sidebar'
import Navbar from '../../../components/shared/navbar'

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const cookieStore = await cookies()
	const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

	return (
		<ThemeProvider
			attribute='class'
			defaultTheme='system'
			enableSystem
			disableTransitionOnChange
		>
			<SidebarProvider defaultOpen={defaultOpen}>
				<div className='flex w-full'>
					<AppSidebar />
					<main className='w-full'>
						<Navbar />
						<div className='px-4'>{children}</div>
					</main>
				</div>
			</SidebarProvider>
		</ThemeProvider>
	)
}
