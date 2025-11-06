import React from 'react'
import { Button } from './ui/button'
import { FileText } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

/**
 * Component to generate the dropping-template.docx file
 */
export function GenerateDroppingTemplate() {
  const handleGenerateTemplate = async () => {
    try {
      const templateUrl = new URL('../templates/binary/dropping_form_template.zip', import.meta.url)
      const response = await fetch(templateUrl)
      if (!response.ok) {
        throw new Error('Binary template not found. Ensure dropping_form_template.zip exists under src/templates/binary')
      }
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'dropping-template.docx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Downloaded dropping form template. You can inspect or modify placeholders.')
    } catch (error) {
      console.error('Error downloading template:', error)
      toast.error('Failed to download binary template')
    }
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleGenerateTemplate}
      className="gap-2"
    >
      <FileText className="h-4 w-4" />
      Generate Dropping Template
    </Button>
  )
}
