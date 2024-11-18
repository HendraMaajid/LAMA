import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase = createClient(
    environment.supabaseUrl, 
    environment.supabaseKey
  );

  async uploadImage(file: File): Promise<string> {
  try {
    const user = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const fileName = `news_${Date.now()}_${file.name}`;
    
    const { data, error } = await this.supabase.storage
      .from('news-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = this.supabase.storage
      .from('news-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Upload error', error);
    throw error;
  }
}
}