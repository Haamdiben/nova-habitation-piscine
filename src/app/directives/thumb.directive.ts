import { Directive, computed, input, linkedSignal } from '@angular/core';
import { thumbUrl, uploadUrl } from '../utils/upload-url';

/**
 * Show the thumbnail of an uploaded photo where it's displayed small: `<img [appThumb]="photo.filepath">`.
 * Falls back to the original file if the thumbnail is missing.
 */
@Directive({
  selector: 'img[appThumb]',
  standalone: true,
  host: { '[src]': 'src()', '(error)': 'onError()' },
})
export class ThumbDirective {
  filepath = input.required<string>({ alias: 'appThumb' });

  private useOriginal = linkedSignal({ source: this.filepath, computation: () => false });
  protected src = computed(() => (this.useOriginal() ? uploadUrl : thumbUrl)(this.filepath()));

  protected onError() {
    this.useOriginal.set(true);
  }
}
