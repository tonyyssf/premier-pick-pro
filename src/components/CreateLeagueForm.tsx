
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface FormData {
  name: string;
  description: string;
  isPublic: boolean;
  maxMembers: number;
}

interface CreateLeagueFormProps {
  formData: FormData;
  errors: Record<string, string>;
  isLoading: boolean;
  userLeagueCount: number;
  maxLeagues: number;
  onInputChange: (field: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const CreateLeagueForm: React.FC<CreateLeagueFormProps> = ({
  formData,
  errors,
  isLoading,
  userLeagueCount,
  maxLeagues,
  onInputChange,
  onSubmit,
  onCancel
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="text-sm text-gray-900 mb-4">
        You have created {userLeagueCount} of {maxLeagues} leagues allowed.
      </div>

      <div>
        <Label htmlFor="name" className="text-gray-900">League Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="Enter league name"
          required
          className={`text-gray-900 placeholder:text-gray-500 ${errors.name ? 'border-red-500' : ''}`}
        />
        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
      </div>
      
      <div>
        <Label htmlFor="description" className="text-gray-900">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="Describe your league..."
          rows={3}
          className={`text-gray-900 placeholder:text-gray-500 ${errors.description ? 'border-red-500' : ''}`}
        />
        {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
      </div>
      
      <div>
        <Label htmlFor="maxMembers" className="text-gray-900">Maximum Members</Label>
        <Input
          id="maxMembers"
          type="number"
          min="2"
          max="500"
          value={formData.maxMembers}
          onChange={(e) => onInputChange('maxMembers', parseInt(e.target.value))}
          className={`text-gray-900 ${errors.maxMembers ? 'border-red-500' : ''}`}
        />
        {errors.maxMembers && <p className="text-sm text-red-500 mt-1">{errors.maxMembers}</p>}
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="isPublic"
          checked={formData.isPublic}
          onCheckedChange={(checked) => onInputChange('isPublic', checked)}
        />
        <Label htmlFor="isPublic" className="text-gray-900">Make league public</Label>
      </div>
      
      <div className="flex space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Creating...' : 'Create League'}
        </Button>
      </div>
    </form>
  );
};
