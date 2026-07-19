'use client';

import React from 'react';
import TemplatePicker from '@/components/template/TemplatePicker';
import { SmartTemplateConfig, SmartTemplatesRegistry } from '@/templates';
import { DocumentTemplate } from '@/types';

interface TemplateSelectorProps {
  onSelectTemplate: (template: DocumentTemplate) => void;
  activeTemplateId: string | null;
}

export default function TemplateSelector({
  onSelectTemplate,
  activeTemplateId,
}: TemplateSelectorProps) {
  const handleSelect = (config: SmartTemplateConfig) => {
    onSelectTemplate({
      id: config.id,
      name: config.name,
      description: config.description,
      defaultTitle: config.defaultTitle,
      content: config.sampleContent,
    });
  };

  return (
    <TemplatePicker
      activeTemplateId={activeTemplateId}
      onSelectTemplate={handleSelect}
    />
  );
}
