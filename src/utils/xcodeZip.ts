import JSZip from 'jszip';
import { SWIFT_FILES } from '../data/swiftCode';

export async function generateXcodeZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root folder
  const root = zip.folder('SchoolAlarm-iOS');
  if (!root) throw new Error('Could not create zip folder');

  // Source files folder
  const sourceFolder = root.folder('SchoolAlarm');
  if (sourceFolder) {
    // Add all swift and info.plist files
    for (const file of SWIFT_FILES) {
      sourceFolder.file(file.name, file.content);
    }

    // Add Assets.xcassets
    const assetsFolder = sourceFolder.folder('Assets.xcassets');
    if (assetsFolder) {
      assetsFolder.file(
        'Contents.json',
        JSON.stringify(
          {
            info: {
              author: 'xcode',
              version: 1,
            },
          },
          null,
          2
        )
      );

      const appIconFolder = assetsFolder.folder('AppIcon.appiconset');
      if (appIconFolder) {
        appIconFolder.file(
          'Contents.json',
          JSON.stringify(
            {
              images: [
                {
                  idiom: 'universal',
                  platform: 'ios',
                  size: '1024x1024',
                },
              ],
              info: {
                author: 'xcode',
                version: 1,
              },
            },
            null,
            2
          )
        );
      }
    }
  }

  // Add README
  root.file(
    'README.md',
    `# School Alarm - Native iOS App in Swift and SwiftUI

Target Portal: https://schoolalarms.blogspot.com

## How to Run in Xcode:
1. Open Xcode on macOS.
2. Select "Open existing project" or create a new SwiftUI iOS App named "SchoolAlarm".
3. Drag and drop the files from the SchoolAlarm folder into your Xcode project navigator.
4. Ensure Info.plist is added to your target settings.
5. Hit Cmd+R to build and run on any iOS Simulator or connected iPhone!
`
  );

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
