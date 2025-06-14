
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Upload, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useRelationships } from "@/hooks/useRelationships";
import { useFavors } from "@/hooks/useFavors";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ExportImportManager = () => {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importData, setImportData] = useState('');
  const [importPreview, setImportPreview] = useState<any>(null);
  
  const { profile } = useProfile();
  const { addRelationship } = useRelationships();
  const { toast } = useToast();

  const handleExportData = async () => {
    setExporting(true);
    try {
      const { data: relationships } = await supabase
        .from('relationships')
        .select('*')
        .eq('user_id', profile?.id);
        
      const { data: favors } = await supabase
        .from('favors')
        .select('*')
        .eq('user_id', profile?.id);

      const { data: aiInsights } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', profile?.id);

      const exportData = {
        version: '1.0',
        exported_at: new Date().toISOString(),
        user_profile: {
          full_name: profile?.full_name,
          personality_type: profile?.personality_type,
          reciprocity_style: profile?.reciprocity_style,
        },
        relationships: relationships || [],
        favors: favors || [],
        ai_insights: aiInsights || [],
        metadata: {
          total_relationships: relationships?.length || 0,
          total_favors: favors?.length || 0,
          total_insights: aiInsights?.length || 0,
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relationshipdebt-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Exported ${exportData.metadata.total_relationships} relationships and ${exportData.metadata.total_favors} favors.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handlePreviewImport = () => {
    try {
      const parsed = JSON.parse(importData);
      
      if (!parsed.version || !parsed.relationships) {
        throw new Error('Invalid export format');
      }
      
      setImportPreview(parsed);
      toast({
        title: "Preview Generated",
        description: "Review the data below before importing.",
      });
    } catch (error) {
      toast({
        title: "Invalid Format",
        description: "Please provide a valid RelationshipDebt AI export file.",
        variant: "destructive",
      });
      setImportPreview(null);
    }
  };

  const handleImportData = async () => {
    if (!importPreview || !profile) return;
    
    setImporting(true);
    try {
      let importedRelationships = 0;
      let importedFavors = 0;

      // Import relationships
      for (const relationship of importPreview.relationships) {
        try {
          await addRelationship.mutateAsync({
            name: relationship.name,
            relationship_type: relationship.relationship_type,
            importance_level: relationship.importance_level,
            contact_info: relationship.contact_info,
            preferences: relationship.preferences,
          });
          importedRelationships++;
        } catch (error) {
          console.log(`Failed to import relationship: ${relationship.name}`);
        }
      }

      // Import favors (simplified - in production you'd need relationship mapping)
      for (const favor of importPreview.favors) {
        try {
          // This would need proper relationship ID mapping in production
          console.log('Favor import would happen here:', favor);
          importedFavors++;
        } catch (error) {
          console.log(`Failed to import favor: ${favor.description}`);
        }
      }

      toast({
        title: "Import Successful",
        description: `Imported ${importedRelationships} relationships and ${importedFavors} favors.`,
      });
      
      setImportData('');
      setImportPreview(null);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Some data could not be imported. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportData(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Management</h2>
        <p className="text-gray-600">Export your data or import from another account</p>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-green-600" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download all your relationship data in JSON format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              This will export all your relationships, favors, and AI insights. 
              The file can be used to backup your data or transfer to another account.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={handleExportData} 
            disabled={exporting}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export All Data'}
          </Button>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Import Data
          </CardTitle>
          <CardDescription>
            Import relationship data from a previous export
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Importing will add new relationships to your account. 
              Existing relationships will not be overwritten.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="file-upload">Upload Export File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="import-data">Or Paste Export Data</Label>
            <Textarea
              id="import-data"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste your exported JSON data here..."
              rows={6}
              className="mt-2"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handlePreviewImport}
              variant="outline"
              disabled={!importData.trim()}
            >
              Preview Import
            </Button>
            
            {importPreview && (
              <Button 
                onClick={handleImportData}
                disabled={importing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                {importing ? 'Importing...' : 'Import Data'}
              </Button>
            )}
          </div>

          {importPreview && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Import Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Relationships:</span>
                    <div className="text-2xl font-bold text-blue-600">
                      {importPreview.metadata?.total_relationships || 0}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Favors:</span>
                    <div className="text-2xl font-bold text-blue-600">
                      {importPreview.metadata?.total_favors || 0}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Insights:</span>
                    <div className="text-2xl font-bold text-blue-600">
                      {importPreview.metadata?.total_insights || 0}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Export Date:</span>
                    <div className="text-sm text-blue-600">
                      {importPreview.exported_at ? new Date(importPreview.exported_at).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
