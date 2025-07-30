import { useEffect, useRef } from "react";

const UploadWidget = () => {
  const cloudinaryRef = useRef<any>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // @ts-ignore
    cloudinaryRef.current = window.cloudinary;
    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_IMAGE_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_IMAGE_UPLOAD_PRESET,
      },
      function (error: any, result: any) {
        console.log(result);
        // Handle the result or error here
      }
    );
  }, []);

  return (
    <div>
      <button onClick={() => widgetRef.current.open()}>Upload</button>
    </div>
  );
};

export default UploadWidget;
