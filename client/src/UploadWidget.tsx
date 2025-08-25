import { useRef } from "react";

interface UploadWidgetProps {
  pollId?: number | string;
  questionId?: number | string;
}

const UploadWidget = ({ pollId, questionId }: UploadWidgetProps) => {
  const cloudinaryRef = useRef<any>(null);
  const generateSignature = async (cb: Function, paramsToSign: any) => {
    try {
      const queryParams = Object.keys(paramsToSign)
        .map((key) => `${key}=${encodeURIComponent(paramsToSign[key])}`)
        .join("&");
      const url = `/api/signature?${queryParams}`;
      const response = await fetch(url, { method: "GET" });
      const signature = await response.json();
      cb(signature);
    } catch (error) {
      console.log(error);
    }
  };

  const uploadQuestionImage = () => {
    // @ts-ignore
    cloudinaryRef.current = window.cloudinary;
    cloudinaryRef.current.openUploadWidget(
      {
        cloudName: import.meta.env.VITE_IMAGE_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_IMAGE_UPLOAD_PRESET,
        api_key: import.meta.env.VITE_API_KEY,
        uploadSignature: generateSignature,
        asset_folder: `polls/${pollId}`,
        publicId: `polls/${pollId}/questions/${questionId}`,
      },
      (err: any, res: any) => {
        if (err) {
          console.log(err);
        }
        if (res) {
          console.log(res);
        }
      }
    );
  };

  return (
    <div>
      <button onClick={() => uploadQuestionImage()}>Upload</button>
    </div>
  );
};

export default UploadWidget;
