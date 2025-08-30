import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message is too long')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = contactSchema.parse(body)
    
    // Here you would typically:
    // 1. Save to database
    // 2. Send email notification
    // 3. Integrate with CRM
    
    // For now, just log the contact form submission
    console.log('Contact form submission:', validatedData)
    
    // Simulate email sending
    // await sendEmail({
    //   to: 'restaurant@example.com',
    //   subject: `New contact form submission: ${validatedData.subject || 'General Inquiry'}`,
    //   html: `
    //     <h3>New Contact Form Submission</h3>
    //     <p><strong>Name:</strong> ${validatedData.name}</p>
    //     <p><strong>Email:</strong> ${validatedData.email}</p>
    //     ${validatedData.phone ? `<p><strong>Phone:</strong> ${validatedData.phone}</p>` : ''}
    //     ${validatedData.subject ? `<p><strong>Subject:</strong> ${validatedData.subject}</p>` : ''}
    //     <p><strong>Message:</strong></p>
    //     <p>${validatedData.message}</p>
    //   `
    // })

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon!'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid form data',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process your message. Please try again.'
      },
      { status: 500 }
    )
  }
}