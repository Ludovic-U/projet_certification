import { clerkClient } from '@clerk/nextjs/server'

export async function POST() {
    try {    
        const client = await clerkClient()
        client.users.createUser({
            firstName: 'Test',
            lastName: 'User',
            emailAddress: ['testclerk123@gmail.com'],
            password: 'password',
          })
      return Response.json({ message: 'User created', client })
    } catch (error) {
      console.log(error)
      return Response.json({ error: 'Error creating user' })
    }
  }