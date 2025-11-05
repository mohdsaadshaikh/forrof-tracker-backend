import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '../lib/auth.js'
import { sendEmail } from '../lib/mailer.js'

export const reportIssue = async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })

    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { subject, category, description } = req.body

    if (!subject && !category && !description) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    await sendEmail({
      to: 'mohammadsaad925s4s@gmail.com',
      subject: `[REPORT] ${category} - ${subject}`,
      html: `
        <h2>New Issue Reported</h2>
        <p><strong>User:</strong> ${session.user.name} (${session.user.email})</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Description:</strong></p>
        <p>${description.replace(/\n/g, '<br>')}</p>
      `,
    })

    return res.json({ message: 'Report sent successfully' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Failed to send report' })
  }
}
