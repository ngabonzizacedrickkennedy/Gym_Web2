"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Phone,
  Upload,
  AlertTriangle,
  Calendar,
  MapPin,
  Weight,
  Ruler,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Heart,
  Shield,
  Clock,
} from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Progress } from "@/components/ui/progress";

// CORRECTED Form schema - matches backend exactly
const profileSetupSchema = z.object({
  // Personal Information - MATCH BACKEND EXACTLY
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  phoneNumber: z.string().optional(),

  // Physical Attributes - MATCH BACKEND FIELD NAMES
  heightCm: z.number().min(100).max(250).optional(),
  currentWeightKg: z.number().min(30).max(300).optional(),
  targetWeightKg: z.number().min(30).max(300).optional(),

  // Fitness Information - MATCH BACKEND ENUMS
  fitnessLevel: z
    .enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"])
    .optional(),
  primaryGoal: z
    .enum([
      "WEIGHT_LOSS",
      "MUSCLE_GAIN",
      "STRENGTH_BUILDING",
      "ENDURANCE",
      "FLEXIBILITY",
      "GENERAL_FITNESS",
    ])
    .optional(),

  // Fitness Details
  workoutFrequency: z.number().min(1).max(7).optional(),
  workoutDuration: z.number().min(15).max(180).optional(),
  preferredWorkoutDays: z.array(z.string()).optional(),
  preferredWorkoutTimes: z.array(z.string()).optional(),

  // Health Information - CRITICAL MISSING FIELDS
  healthConditions: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  dietaryRestrictions: z.array(z.string()).optional(),

  // Preferences - CRITICAL MISSING FIELD
  timezone: z.string().optional(),
  language: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  privacyLevel: z.enum(["PUBLIC", "FRIENDS", "PRIVATE"]).optional(),
});

type ProfileSetupFormValues = z.infer<typeof profileSetupSchema>;

export function ProfileSetupForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [setupProgress, setSetupProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, setupProfile } = useAuth();
  const router = useRouter();

  // FIXED useForm with correct default values
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<ProfileSetupFormValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      firstName: user?.profile?.firstName || "",
      lastName: user?.profile?.lastName || "",
      phoneNumber: user?.profile?.phoneNumber || "",

      // CRITICAL: Add default values for missing fields
      gender: undefined,
      dateOfBirth: "",
      timezone: "UTC", // Default timezone instead of undefined
      language: "en",

      // Fitness defaults with correct enum values
      fitnessLevel: "BEGINNER",
      primaryGoal: "GENERAL_FITNESS",

      // Health information defaults
      healthConditions: [],
      medications: [],
      emergencyContactName: "",
      emergencyContactPhone: "",
      dietaryRestrictions: [],

      // Preferences
      emailNotifications: true,
      pushNotifications: true,
      privacyLevel: "PRIVATE",

      // Arrays and numbers
      preferredWorkoutDays: [],
      preferredWorkoutTimes: [],
      workoutFrequency: undefined,
      workoutDuration: undefined,
      heightCm: undefined,
      currentWeightKg: undefined,
      targetWeightKg: undefined,
    },
    mode: "onChange",
  });

  // Update progress bar based on form completion
  const updateProgress = useCallback(() => {
    const values = getValues();
    let completedFields = 0;
    let totalFields = 0;

    // Count basic required fields
    const basicFields = ["firstName", "lastName"];
    basicFields.forEach((field) => {
      totalFields++;
      if (values[field as keyof ProfileSetupFormValues]) completedFields++;
    });

    // Count optional but important fields
    const optionalFields = [
      "phoneNumber",
      "gender",
      "dateOfBirth",
      "heightCm",
      "currentWeightKg",
      "fitnessLevel",
      "primaryGoal",
      "timezone",
    ];
    optionalFields.forEach((field) => {
      totalFields++;
      if (values[field as keyof ProfileSetupFormValues]) completedFields++;
    });

    // Count array fields
    if (values.preferredWorkoutDays && values.preferredWorkoutDays.length > 0) {
      completedFields++;
    }
    totalFields++;

    if (values.dietaryRestrictions && values.dietaryRestrictions.length > 0) {
      completedFields++;
    }
    totalFields++;

    // Add profile image to counts
    totalFields++;
    if (profileImage) completedFields++;

    const progress = Math.round((completedFields / totalFields) * 100);
    setSetupProgress(progress);
  }, [getValues, profileImage]);

  // Track changes for progress updates
  const watchedValues = watch();

  // Update progress when form values change
  useEffect(() => {
    updateProgress();
  }, [watchedValues, updateProgress]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileImage(e.target.result as string);
          updateProgress();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const nextTab = () => {
    if (activeTab === "personal") setActiveTab("fitness");
    else if (activeTab === "fitness") setActiveTab("health");
    else if (activeTab === "health") setActiveTab("preferences");
  };

  const previousTab = () => {
    if (activeTab === "preferences") setActiveTab("health");
    else if (activeTab === "health") setActiveTab("fitness");
    else if (activeTab === "fitness") setActiveTab("personal");
  };

  const toggleWorkoutDay = (day: string) => {
    const currentDays = getValues("preferredWorkoutDays") || [];
    if (currentDays.includes(day)) {
      setValue(
        "preferredWorkoutDays",
        currentDays.filter((d) => d !== day)
      );
    } else {
      setValue("preferredWorkoutDays", [...currentDays, day]);
    }
    updateProgress();
  };

  const toggleDietaryRestriction = (restriction: string) => {
    const currentRestrictions = getValues("dietaryRestrictions") || [];
    if (currentRestrictions.includes(restriction)) {
      setValue(
        "dietaryRestrictions",
        currentRestrictions.filter((r) => r !== restriction)
      );
    } else {
      setValue("dietaryRestrictions", [...currentRestrictions, restriction]);
    }
    updateProgress();
  };

  const toggleHealthCondition = (condition: string) => {
    const currentConditions = getValues("healthConditions") || [];
    if (currentConditions.includes(condition)) {
      setValue(
        "healthConditions",
        currentConditions.filter((c) => c !== condition)
      );
    } else {
      setValue("healthConditions", [...currentConditions, condition]);
    }
    updateProgress();
  };

  const toggleMedication = (medication: string) => {
    const currentMedications = getValues("medications") || [];
    if (currentMedications.includes(medication)) {
      setValue(
        "medications",
        currentMedications.filter((m) => m !== medication)
      );
    } else {
      setValue("medications", [...currentMedications, medication]);
    }
    updateProgress();
  };

  // FIXED onSubmit function with correct mapping
  const onSubmit = async (data: ProfileSetupFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      // CRITICAL: Map form data to correct backend fields
      const profileData = {
        // Personal Information - direct mapping
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        phoneNumber: data.phoneNumber,

        // Physical Attributes - correct field names
        heightCm: data.heightCm,
        currentWeightKg: data.currentWeightKg,
        targetWeightKg: data.targetWeightKg,

        // Fitness Information - correct enums and field names
        fitnessLevel: data.fitnessLevel,
        primaryGoal: data.primaryGoal,
        workoutFrequency: data.workoutFrequency,
        workoutDuration: data.workoutDuration,
        preferredWorkoutDays: data.preferredWorkoutDays,
        preferredWorkoutTimes: data.preferredWorkoutTimes,

        // Health Information - CRITICAL: Include these fields
        healthConditions: data.healthConditions || [],
        medications: data.medications || [],
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        dietaryRestrictions: data.dietaryRestrictions || [],

        // Preferences - CRITICAL: Include timezone
        timezone: data.timezone,
        language: data.language || "en",
        emailNotifications: data.emailNotifications ?? true,
        pushNotifications: data.pushNotifications ?? true,
        privacyLevel: data.privacyLevel || "PRIVATE",
      };

      console.log("Sending profile data:", profileData);

      await setupProfile(profileData);

      setSuccessMessage("Profile setup completed successfully!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Profile setup error:", err);
      setError("Profile setup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Watch form inputs to enable/disable buttons
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const isPersonalInfoComplete = firstName && lastName;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
        <CardDescription>
          Let&apos;s personalize your experience to help you achieve your
          fitness goals
        </CardDescription>
        <div className="mt-4">
          <Progress value={setupProgress} className="h-2" />
          <p className="text-xs text-neutral-500 mt-1 text-right">
            {setupProgress}% Complete
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="fitness" disabled={!isPersonalInfoComplete}>
                Fitness
              </TabsTrigger>
              <TabsTrigger value="health" disabled={!isPersonalInfoComplete}>
                Health
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                disabled={!isPersonalInfoComplete}
              >
                Preferences
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-6">
              {/* Profile image upload */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative h-24 w-24 mb-4">
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt="Profile preview"
                      fill
                      className="rounded-full object-cover border-4 border-primary/20"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-neutral-100 flex items-center justify-center border-4 border-primary/20">
                      <User className="h-12 w-12 text-neutral-400" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={triggerFileInput}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
              </div>

              {/* Personal information fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                      id="firstName"
                      className={`pl-10 ${
                        errors.firstName
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                      disabled={isLoading}
                      {...register("firstName")}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-sm text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                      id="lastName"
                      className={`pl-10 ${
                        errors.lastName
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                      disabled={isLoading}
                      {...register("lastName")}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-sm text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      className="pl-10"
                      disabled={isLoading}
                      {...register("dateOfBirth")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={getValues("gender")}
                    onValueChange={(value) => setValue("gender", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                      <SelectItem value="PREFER_NOT_TO_SAY">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                      id="phoneNumber"
                      placeholder="(123) 456-7890"
                      className="pl-10"
                      disabled={isLoading}
                      {...register("phoneNumber")}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  type="button"
                  onClick={nextTab}
                  disabled={!isPersonalInfoComplete}
                >
                  Next: Fitness Profile <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Fitness Information Tab */}
            <TabsContent value="fitness" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="heightCm">Height (cm)</Label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                      id="heightCm"
                      type="number"
                      min="100"
                      max="250"
                      placeholder="170"
                      className="pl-10"
                      disabled={isLoading}
                      {...register("heightCm", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentWeightKg">Current Weight (kg)</Label>
                  <div className="relative">
                    <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                      id="currentWeightKg"
                      type="number"
                      min="30"
                      max="300"
                      placeholder="70"
                      className="pl-10"
                      disabled={isLoading}
                      {...register("currentWeightKg", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetWeightKg">Target Weight (kg)</Label>
                  <div className="relative">
                    <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                      id="targetWeightKg"
                      type="number"
                      min="30"
                      max="300"
                      placeholder="65"
                      className="pl-10"
                      disabled={isLoading}
                      {...register("targetWeightKg", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fitnessLevel">Fitness Level</Label>
                  <Select
                    value={getValues("fitnessLevel")}
                    onValueChange={(value) =>
                      setValue("fitnessLevel", value as any)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fitness level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                      <SelectItem value="EXPERT">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Primary Fitness Goal</Label>
                  <RadioGroup
                    value={watch("primaryGoal")}
                    onValueChange={(value) =>
                      setValue("primaryGoal", value as any)
                    }
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="WEIGHT_LOSS" id="WEIGHT_LOSS" />
                        <Label htmlFor="WEIGHT_LOSS" className="cursor-pointer">
                          Weight Loss
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="MUSCLE_GAIN" id="MUSCLE_GAIN" />
                        <Label htmlFor="MUSCLE_GAIN" className="cursor-pointer">
                          Muscle Gain
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="STRENGTH_BUILDING"
                          id="STRENGTH_BUILDING"
                        />
                        <Label
                          htmlFor="STRENGTH_BUILDING"
                          className="cursor-pointer"
                        >
                          Strength Building
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ENDURANCE" id="ENDURANCE" />
                        <Label htmlFor="ENDURANCE" className="cursor-pointer">
                          Endurance
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="FLEXIBILITY" id="FLEXIBILITY" />
                        <Label htmlFor="FLEXIBILITY" className="cursor-pointer">
                          Flexibility
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="GENERAL_FITNESS"
                          id="GENERAL_FITNESS"
                        />
                        <Label
                          htmlFor="GENERAL_FITNESS"
                          className="cursor-pointer"
                        >
                          General Fitness
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workoutFrequency">Workouts per week</Label>
                  <Input
                    id="workoutFrequency"
                    type="number"
                    min="1"
                    max="7"
                    placeholder="3"
                    disabled={isLoading}
                    {...register("workoutFrequency", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workoutDuration">
                    Workout duration (minutes)
                  </Label>
                  <Input
                    id="workoutDuration"
                    type="number"
                    min="15"
                    max="180"
                    placeholder="45"
                    disabled={isLoading}
                    {...register("workoutDuration", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <Button type="button" variant="outline" onClick={previousTab}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="button" onClick={nextTab}>
                  Next: Health Info <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Health Information Tab */}
            <TabsContent value="health" className="space-y-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">
                      <Shield className="inline h-4 w-4 mr-1" />
                      Emergency Contact Name
                    </Label>
                    <Input
                      id="emergencyContactName"
                      placeholder="John Doe"
                      disabled={isLoading}
                      {...register("emergencyContactName")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Emergency Contact Phone
                    </Label>
                    <Input
                      id="emergencyContactPhone"
                      placeholder="+1234567890"
                      disabled={isLoading}
                      {...register("emergencyContactPhone")}
                    />
                  </div>
                </div>

                <div>
                  <Label className="block mb-3">
                    <Heart className="inline h-4 w-4 mr-1" />
                    Health Conditions (if any)
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      "None",
                      "Diabetes",
                      "Hypertension",
                      "Heart Disease",
                      "Asthma",
                      "Arthritis",
                      "Other",
                    ].map((condition) => {
                      const isSelected =
                        watch("healthConditions")?.includes(condition);
                      return (
                        <Button
                          key={condition}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          className={`py-1 h-10 ${
                            isSelected ? "bg-primary" : ""
                          }`}
                          onClick={() => toggleHealthCondition(condition)}
                        >
                          {condition}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="block mb-3">
                    Current Medications (if any)
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      "None",
                      "Blood Pressure",
                      "Diabetes",
                      "Heart",
                      "Pain Relief",
                      "Vitamins",
                      "Other",
                    ].map((medication) => {
                      const isSelected =
                        watch("medications")?.includes(medication);
                      return (
                        <Button
                          key={medication}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          className={`py-1 h-10 ${
                            isSelected ? "bg-primary" : ""
                          }`}
                          onClick={() => toggleMedication(medication)}
                        >
                          {medication}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <Button type="button" variant="outline" onClick={previousTab}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="button" onClick={nextTab}>
                  Next: Preferences <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Timezone
                    </Label>
                    <Select
                      value={getValues("timezone")}
                      onValueChange={(value) => setValue("timezone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">
                          Eastern Time
                        </SelectItem>
                        <SelectItem value="America/Chicago">
                          Central Time
                        </SelectItem>
                        <SelectItem value="America/Denver">
                          Mountain Time
                        </SelectItem>
                        <SelectItem value="America/Los_Angeles">
                          Pacific Time
                        </SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={getValues("language")}
                      onValueChange={(value) => setValue("language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Privacy Level</Label>
                  <RadioGroup
                    value={watch("privacyLevel")}
                    onValueChange={(value) =>
                      setValue("privacyLevel", value as any)
                    }
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="PUBLIC" id="PUBLIC" />
                        <Label htmlFor="PUBLIC" className="cursor-pointer">
                          Public - Anyone can see your profile
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="FRIENDS" id="FRIENDS" />
                        <Label htmlFor="FRIENDS" className="cursor-pointer">
                          Friends Only - Only friends can see your profile
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="PRIVATE" id="PRIVATE" />
                        <Label htmlFor="PRIVATE" className="cursor-pointer">
                          Private - Only you can see your profile
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="block mb-3">Preferred Workout Days</Label>
                  <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day) => {
                      const isSelected = watch(
                        "preferredWorkoutDays"
                      )?.includes(day);
                      return (
                        <Button
                          key={day}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          className={`py-1 h-10 ${
                            isSelected ? "bg-primary" : ""
                          }`}
                          onClick={() => toggleWorkoutDay(day)}
                        >
                          {day.slice(0, 3)}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="block mb-3">
                    Dietary Restrictions (if any)
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      "None",
                      "Vegetarian",
                      "Vegan",
                      "Gluten-Free",
                      "Dairy-Free",
                      "Nut-Free",
                      "Keto",
                      "Paleo",
                    ].map((restriction) => {
                      const isSelected = watch("dietaryRestrictions")?.includes(
                        restriction
                      );
                      return (
                        <Button
                          key={restriction}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          className={`py-1 h-10 ${
                            isSelected ? "bg-primary" : ""
                          }`}
                          onClick={() => toggleDietaryRestriction(restriction)}
                        >
                          {restriction}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <Label className="text-base font-medium">
                    Notification Preferences
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Notifications</Label>
                        <p className="text-sm text-gray-600">
                          Receive workout reminders and progress updates via
                          email
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          className="rounded border-gray-300"
                          {...register("emailNotifications")}
                        />
                        <Label
                          htmlFor="emailNotifications"
                          className="cursor-pointer"
                        >
                          {watch("emailNotifications") ? "Enabled" : "Disabled"}
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Push Notifications</Label>
                        <p className="text-sm text-gray-600">
                          Get instant notifications on your device
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="pushNotifications"
                          className="rounded border-gray-300"
                          {...register("pushNotifications")}
                        />
                        <Label
                          htmlFor="pushNotifications"
                          className="cursor-pointer"
                        >
                          {watch("pushNotifications") ? "Enabled" : "Disabled"}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <Button type="button" variant="outline" onClick={previousTab}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  {isLoading ? "Saving Profile..." : "Complete Setup"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm text-neutral-500">
        You can always update your profile information later from your account
        settings.
      </CardFooter>
    </Card>
  );
}
