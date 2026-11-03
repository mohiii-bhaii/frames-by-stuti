import { EditableImage, type EditableImageProps } from "@/components/editable-image";
import type { ImageSlot } from "@/lib/images";

/** A photograph from the image registry. Editable by admins in the visual editor. */
export function Photo(props: EditableImageProps & { slot: ImageSlot }) {
  return <EditableImage {...props} />;
}
